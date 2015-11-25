var parallelcordController = ['$scope',function($scope){
	
	console.log("ParallelcordChartController :: ReadyState");
	
	$scope.clickhandler = function(d) {
		$scope.toggle(d)
		$scope.update($scope.data)
	};
	
	$scope.toggleAll = function(d) {
		if (d.children) {
			d.children.forEach($scope.toggleAll);
			$scope.toggle(d);
		}
	};
	
	$scope.toggle = function(d) {
		if (d.children) {
			d._children = d.children;
			d.children = null;
		} else {
			d.children = d._children;
			d._children = null;
		}
	}
				
	$scope.tooltip = {};
	$scope.tooltipUpdate = function(d) {
		$scope.tooltip = d
	}
}];

var parallelcordDirective = ['$window', '$timeout', '$http', function($window, $timeout, $http) {
	/*var div_id = UniqueString.encode(Math.floor((Math.random() * 999999999) + 999));*/
	return {
		restrict: 'AE',
		replace: true,
		scope: true,
		// DON'T CHANGE THE TEMPLATE
		/*template: "<div id='chart-"+ div_id +"'><canvas id='background'></canvas> <canvas id='foreground'></canvas> <canvas id='highlight'></canvas></div>",*/
		template: "<div id='chart'> <canvas id='background'></canvas> <canvas id='foreground'></canvas> <canvas id='highlight'></canvas></div>",
		link: function(scope, element, attrs) {
			
			//console.log("Div : "+div_id);
			console.log("div width : "+document.getElementById("chart").clientWidth);
			console.log("div width offset : "+document.getElementById("chart").clientHeight);
			 
			
		/*var options = scope.$eval(attrs.options);
				console.log(options['height'])
				var height = (options['height']) ? options['height'] + 'px' : '720px';
				var width = (options['width']) ? options['width'] + 'px' : '100%';
				var m = (options['padding']) ? options['padding'] : [30, 30];
				angular.element(element[0]).css("height", height);
				angular.element(element[0]).css("width", width);
				angular.element(element[0]).css("marginTop", m[0]+'px');*/
			var width = document.getElementById("chart").offsetWidth,
		    height = 240;
			//alert("width : "+width+" height : "+height);
			
				var m = [60, 0, 10, 0],
				    w = width - m[1] - m[3],
				    h = height - m[0] - m[2],
				    xscale = d3.scale.ordinal().rangePoints([0, w], 1),
				    yscale = {},
				    dragging = {},
				    line = d3.svg.line(),
				    axis = d3.svg.axis().orient("left").ticks(1+height/50),
				    data,
				    foreground,
				    background,
				    highlighted,
				    keys,
				    dimensions,                           
				    n_dimensions,
				    legend,	
				    render_speed = 50,
				    brush_count = 0,
				    excluded_groups = [];
				var precolors= [[28,100,53],[214,56,80],[0,0,33],[30,100,74],[360,59,50],[110,57,71],[120,57,40],[1,100,79],[271,39,57],[274,31,76],[10,30,42],[10,29,67],[318,66,68],[334,80,84],[0,0,50],[0,0,78]];
				console.log("precolors : "+ precolors[0]);
				var colors_val=[];
				var cid=[];
				var colors={};
				var uniquecolor=[];
				var tobe_color;
				var uniqueVal;
				var ordinalfields=[];
				var unqordinalfields=[];
				var hidecol=['End Time'];
				
			// Scale chart and canvas height
				d3.select("#chart")
				    .style("height", (h + m[0] + m[2]) + "px")
				
				d3.selectAll("canvas")
				    .attr("width", w)
				    .attr("height", h)
				    .style("padding", m.join("px ") + "px");
				
				// Foreground canvas for primary view
				foreground = document.getElementById('foreground').getContext('2d');
				foreground.globalCompositeOperation = "destination-over";
				foreground.strokeStyle = "rgba(0,100,160,0.1)";
				foreground.lineWidth = 2;
				//foreground.fillText("Please upload a CSV",w/2,h/2);
				
				// Highlight canvas for temporary interactions
				highlighted = document.getElementById('highlight').getContext('2d');
				highlighted.strokeStyle = "rgba(0,100,160,1)";
				highlighted.lineWidth = 3;
				
				// Background canvas
				background = document.getElementById('background').getContext('2d');
				background.strokeStyle = "rgba(0,100,160,0.1)";
				background.lineWidth = 1.5;
				
				console.log("width : "+width+" height :"+height+" m1 : "+m[0]+" m2 : "+m[1]+" m3 : "+m[2]+" m4 : "+m[3]);
				
				var svg = d3.select("#chart")
			    .append("svg")
			    .attr("width", w + m[1] + m[3])
			    .attr("height", h + m[0] + m[2])
			    .append("svg:g")
				    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
				
				console.log("url : "+ attrs.url);
				var filters=[];
				filters=(attrs.url).split("&");
				console.log("filters : "+ filters[0]);
				var url_sample="";
				console.log(url_sample);
				$http({
						//url: attrs.data
					url:''
					}).then(function(response, status) {
						parallel_coordinates(response.data.responseData);
					});
				
				//start
				Array.prototype.contains = function(elem)
				{
				   for (var i in this)
				   {
				       if (this[i] == elem) return true;
				   }
				   return false;
				}
				
				// Load the data and visualization
				function parallel_coordinates(raw_data) {
				  // Convert quantitative scales to floats
				  data = raw_data.map(function(val,key) {
					 for (var k in val) {
						 if (!_.isNaN(raw_data[0][k] - 0)) {
							 val[k] = parseFloat(val[k]) || 0;
				      }
				      else
				    	  {
				    	  val[k]=val[k];
				    	  ordinalfields.push(k);
				    	  }
				    };
				    return val;
				  });
				  console.log("Data :"+data);
				  unqordinalfields = ordinalfields.filter(function(elem, pos) {
					    return ordinalfields.indexOf(elem) == pos;	
					  });
				  keys = d3.keys(data[0]);
				  tobe_color=keys[0];
				 console.log(" unqordinalfields : "+unqordinalfields+" tobe_color : "+tobe_color+" Column to Hide: "+hidecol);
				  xscale.domain(dimensions = keys.filter(function(k) {
					  if(unqordinalfields.contains(k))
						  {
						   if(hidecol.contains(k))
							  {
							   console.log("to hide");
							   d3.scale.ordinal()
						          .domain(data.map(function(p) {if(k==tobe_color) cid.push(p[k]);return p[k]; }));
								  return false;
							  }
						   else
							   {
							   yscale[k] = d3.scale.ordinal()
					          .domain(data.map(function(p) {if(k==tobe_color) cid.push(p[k]);return p[k]; }))
					          .rangePoints([h, 0]);
							   console.log(k);
							   }
						  }
				     else {
					    	yscale[k] = d3.scale.linear()
					          .domain(d3.extent(data, function(p) {if(k==tobe_color){ console.log("tobe_color : "+tobe_color); cid.push(p[k]);} return +p[k]; }))
					          .range([h, 0]);
					    	console.log(k);
					    }
					  return true;
					  }));
				  uniqueVal = cid.filter(function(elem, pos) {
					    return cid.indexOf(elem) == pos;	
					  });
				  console.log(uniqueVal);
					 var l=0;
				 uniqueVal.forEach(function(entry) {
					 if(precolors[l]==undefined)
						 l=0;
					 colors[entry]=precolors[l];
					 l++;
						});
				 n_dimensions = dimensions.length;
				 console.log("Length : "+n_dimensions+" dimensions : "+dimensions);
				  // Add a group element for each dimension.
				  var g = svg.selectAll(".dimension")
				      .data(dimensions)
				    .enter().append("svg:g")
				      .attr("class", "dimension")
				      .attr("transform", function(d) {
				    	  return "translate(" + xscale(d) + ")"; 
				    	  })
				      .call(d3.behavior.drag()
				        .on("dragstart", function(d) {
				          dragging[d] = this.__origin__ = xscale(d);
				          this.__dragged__ = false;
				          d3.select("#foreground").style("opacity", "0.35");
				        })
				        .on("drag", function(d) {
				          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
				          dimensions.sort(function(a, b) { return position(a) - position(b); });
				          xscale.domain(dimensions);
				          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; });
				          brush_count++;
				          this.__dragged__ = true;
				
				          // Feedback for axis deletion if dropped
				          if (dragging[d] == 0) {
				            d3.select(this).select(".background").style("fill", "#b00");
				          } else {
				            d3.select(this).select(".background").style("fill", null);
				          }
				        }).on("dragend", function(d) {
					          if (!this.__dragged__) {
						            // no movement, invert axis
						            var extent = invert_axis(d);
						            // TODO refactor extents and update_ticks to avoid resetting extents manually
						            update_ticks(d, extent);
						          } else {
						            // reorder axes
						            d3.select(this).transition().attr("transform", "translate(" + xscale(d) + ")");
						          }
						
						          // remove axis if dragged all the way left
						          if (dragging[d] == 0) {
						            remove_axis(d,g);
						          }
						
						          // rerender
						          d3.select("#foreground").style("opacity", null);
						          brush();
						          delete this.__dragged__;
						          delete this.__origin__;
						          delete dragging[d];
						   }))
				
				  // Add and store a brush for each axis.
				  g.append("svg:g")
				      .attr("class", "brush")
				      .each(function(d) {
				    	  d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); 
				    	  })
				    .selectAll("rect")
				      .style("visibility", null)
				      .attr("x", -23)
				      .attr("width", 36)
				      .attr("rx", 0)
				      .attr("ry", 0)
				      .append("title")
				        .text("Drag up or down to brush along this axis");
				
				  g.selectAll(".extent")
				      .append("title")
				        .text("Drag or resize this filter");
				
				  // Add an axis and title.
				  g.append("svg:g")
				      .attr("class", "axis")
				      .attr("transform", "translate(0,0)")
				      .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); })
				    .append("svg:text")
				      .attr("text-anchor", "middle")
				      .attr("y", function(d,i) { return i%2 == 0 ? -14 : -30 } )
				      .attr("x", 0)
				      .attr("class", "label")
				      .text(String)
				      .append("title")
				        .text("Click to invert. Drag to reorder");
				
				   //legend = create_legend(colors,brush);
				
				  // Render full foreground
				  brush();
				
				};
				//end 
				
			// copy one canvas to another, grayscale
				function gray_copy(source, target) {
				  var pixels = source.getImageData(0,0,w,h);
				  target.putImageData(grayscale(pixels),0,0);
				}
				
				// http://www.html5rocks.com/en/tutorials/canvas/imagefilters/
				function grayscale(pixels, args) {
				  var d = pixels.data;
				  for (var i=0; i<d.length; i+=4) {
				    var r = d[i];
				    var g = d[i+1];
				    var b = d[i+2];
				    // CIE luminance for the RGB
				    // The human eye is bad at seeing red and blue, so we de-emphasize them.
				    var v = 0.2126*r + 0.7152*g + 0.0722*b;
				    d[i] = d[i+1] = d[i+2] = v
				  }
				  return pixels;
				};
				
				//start
				// render polylines i to i+render_speed 
				function render_range(selection, i, max, opacity) {
					var j=0;
				  selection.slice(i,max).forEach(function(d) {
					  path(d, foreground, color(uniqueVal[j],opacity));
					  j++;
				  });
				};
				
				// simple data table	
				function data_table(sample) {
				  // sort by first column
				  var sample = sample.sort(function(a,b) {
				    var col = d3.keys(a)[0];
				    return a[col] < b[col] ? -1 : 1;
				  });
				
				  // initialize table and set hover effect
				  var table = d3.select("#food-list")
				    .html("")
				
				  // table headers
				  table
				    .append("tr")
				    .selectAll("th")
				    .data(keys)
				    .enter().append("th")
				      .text(function(d) { return d+"   "; })
				
				  // data entries
				  table
				    .selectAll("tr.row")
				    .data(sample)
				    .enter().append("tr")
				      .attr("class", "row")
				      .on("mouseover", highlight)
				      .on("mouseout", unhighlight)
				    .selectAll("td")
				    .data(function(row) {
				      return keys.map(function(key) {
				    	  return row[key]; })
				    })
				    .enter().append("td")
				    .attr("class",function(d,i){
				    	return (!isNaN(d)?"rownum":"rowtxt");
				    })
				      .text(function(d) {
				    	  return d;
				    	})
				}
				
				// Adjusts rendering speed 
				function optimize(timer) {
				  var delta = (new Date()).getTime() - timer;
				  render_speed = Math.max(Math.ceil(render_speed * 30 / delta), 8);
				  render_speed = Math.min(render_speed, 300);
				  return (new Date()).getTime();
				}
				
				// Feedback on rendering progress
				function render_stats(i,n,render_speed) {
				  d3.select("#rendered-count").text(i);
				  d3.select("#rendered-bar")
				    .style("width", (100*i/n) + "%");
				  d3.select("#render-speed").text(render_speed);
				}
				
				// Feedback on selection
				function selection_stats(opacity, n, total) {
				  d3.select("#data-count").text(total);
				  d3.select("#selected-count").text(n);
				  d3.select("#selected-bar").style("width", (100*n/total) + "%");
				  d3.select("#opacity").text((""+(opacity*100)).slice(0,4) + "%");
				}
				
				// Highlight single polyline
				function highlight(d) {
					//console.log("d : "+d);
				  d3.select("#foreground").style("opacity", "0.35");
				  d3.selectAll(".row").style("opacity", function(p) { return (d == p) ? null : "0.3" });
				  path(d, highlighted, color(uniqueVal[1],1));
				}
				
				// Remove highlight
				function unhighlight() {
				  d3.select("#foreground").style("opacity", null);
				  d3.selectAll(".row").style("opacity", null);
				  highlighted.clearRect(0,0,w,h);
				}
				//end
				
				function invert_axis(d) {
					  // save extent before inverting
					  if (!yscale[d].brush.empty()) {
					    var extent = yscale[d].brush.extent();
					  }
					  if (yscale[d].inverted == true) {
					    yscale[d].range([h, 0]);
					    d3.selectAll('.label')
					      .filter(function(p) { return p == d; })
					      .style("text-decoration", null);
					    yscale[d].inverted = false;
					  } else {
					    yscale[d].range([0, h]);
					    d3.selectAll('.label')
					      .filter(function(p) { return p == d; })
					      .style("text-decoration", "underline");
					    yscale[d].inverted = true;
					  }
					  return extent;
					}
				
				// Draw a single polyline
				function path(d, ctx, color) {
				  if (color) ctx.strokeStyle = color;
				  var x = xscale(0)-15;
				      y = yscale[dimensions[0]](d[dimensions[0]]);   // left edge
				  ctx.beginPath();
				  ctx.moveTo(x,y);
				  dimensions.map(function(p,i) {
					  x = xscale(p),
					    y = yscale[p](d[p]);
					   // ctx.lineTo(x, y);
					    if (i == 0) {
					        ctx.moveTo(x,y);
					      } else { 
					        var cp1x = x - 0.85*(x-x0);
					        var cp1y = y0;
					        var cp2x = x - 0.15*(x-x0);
					        var cp2y = y;
					        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
					      }
					      x0 = x;
					      y0 = y;
				  });
				  ctx.lineTo(x+15, y);                               // right edge
				  ctx.stroke();
				}

				function color(d,a) {
				  var c = colors[d];
				  if(c!=undefined)
				  return ["hsla(",c[0],",",c[1],"%,",c[2],"%,",a,")"].join("");
				}
				
				function position(d) {
				  var v = dragging[d];
				  return v == null ? xscale(d) : v;
				}
				
				// Handles a brush event, toggling the display of foreground lines.
				// TODO refactor
				function brush() {
				  brush_count++;
				  console.log(yscale);
				  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
				      extents = actives.map(function(p) {
			  	      return yscale[p].brush.extent(); });
			    	 
				  // bold dimensions with label
				  d3.selectAll('.label')
				    .style("font-weight", function(dimension) {
				      if (_.include(actives, dimension)) return "bold";
				      return null;
				    });
				
				  // Get lines within extents
				  var selected = [];
				  data
				    .filter(function(d) {
				    	//console.log("exc : "+excluded_groups);
				      return !_.contains(excluded_groups, d.tobe_color);
				    })
				    .map(function(d) {
				      return actives.every(function(p, dimension) {
				    	  //console.log(extents[dimension][0] + " @ " + d[p]);
				    	  var p_new = (yscale[p].ticks)?d[p]:yscale[p](d[p]); 
				        return extents[dimension][0] <= p_new && p_new <= extents[dimension][1];
				      }) ? selected.push(d) : null;
				    });
				
				  if (selected.length < data.length && selected.length > 0) {
				    d3.select("#keep-data").attr("disabled", null);
				    d3.select("#exclude-data").attr("disabled", null);
				  } else {
				    d3.select("#keep-data").attr("disabled", "disabled");
				    d3.select("#exclude-data").attr("disabled", "disabled");
				  };
				
				  
				  // total by food group
				  var tallies = _(selected)
				    .groupBy(function(d) { return d.tobe_color; })
				
				  // include empty groups
				  _(colors).each(function(v,k) { tallies[k] = tallies[k] || []; });
				
				  /*legend
				    .style("text-decoration", function(d) { return _.contains(excluded_groups,d) ? "line-through" : null; })
				    .attr("class", function(d) {
				      return (tallies[d].length > 0)
				           ? "row"
				           : "row off";
				    });
				
				  legend.selectAll(".color-bar")
				    .style("width", function(d) {
				      return Math.ceil(600*tallies[d].length/data.length) + "px"
				    });
				
				  legend.selectAll(".tally")
				    .text(function(d,i) { return tallies[d].length });  */
				  
				
				  // Render selected lines
				  paths(selected, foreground, brush_count, true);
				}
				
				// render a set of polylines on a canvas
				function paths(selected, ctx, count) {
				  var n = selected.length,
				      i = 0,
				      opacity = d3.min([3/Math.pow(n,0.4),1]),
				      timer = (new Date()).getTime();
				
				  selection_stats(opacity, n, data.length)
				
				  shuffled_data = _.shuffle(selected);
				  data_table(shuffled_data);
				
				  ctx.clearRect(0,0,w+1,h+1);
				
				  // render all lines until finished or a new brush event
				  function animloop(){
				    if (i >= n || count < brush_count) return true;
				    var max = d3.min([i+render_speed, n]);
				    render_range(shuffled_data, i, max, opacity);
				    render_stats(max,n,render_speed);
				    i = max;
				    timer = optimize(timer);  // adjusts render_speed
				  };
				
				  d3.timer(animloop);
				}
				
				
				// transition ticks for reordering, rescaling and inverting
				function update_ticks(d, extent) {
				  // update brushes
				  if (d) {
				    var brush_el = d3.selectAll(".brush")
				        .filter(function(key) { return key == d; });
				    // single tick
				    if (extent) {
				      // restore previous extent
				      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).extent(extent).on("brush", brush));
				    } else {
				      brush_el.call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush));
				    }
				  } else {
				    // all ticks
				    d3.selectAll(".brush")
				      .each(function(d) { d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
				  }
				
				  brush_count++;
				
				  show_ticks();
				
				  // update axes
				  d3.selectAll(".axis")
				    .each(function(d,i) {
				      // hide lines for better performance
				      d3.select(this).selectAll('line').style("display", "none");
				
				      // transition axis numbers
				      d3.select(this)
				        .transition()
				        .duration(720)
				        .call(axis.scale(yscale[d]));
				
				      // bring lines back
				      d3.select(this).selectAll('line').transition().delay(800).style("display", null);
				
				      d3.select(this)
				        .selectAll('text')
				        .style('font-weight', null)
				        .style('font-size', null)
				        .style('display', null);
				    });
				}
				
				// Rescale to new dataset domain
				function rescale() {
				  // reset yscales, preserving inverted state
				  dimensions.forEach(function(d,i) {
				    if (yscale[d].inverted) {
				      yscale[d] = d3.scale.linear()
				          .domain(d3.extent(data, function(p) { return +p[d]; }))
				          .range([0, h]);
				      yscale[d].inverted = true;
				    } else {
				      yscale[d] = d3.scale.linear()
				          .domain(d3.extent(data, function(p) { return +p[d]; }))
				          .range([h, 0]);
				    }
				  });
				
				  update_ticks();
				
				  // Render selected data
				  paths(data, foreground, brush_count);
				}
				
				// Get polylines within extents
				function actives() {
				  var actives = dimensions.filter(function(p) { return !yscale[p].brush.empty(); }),
				      extents = actives.map(function(p) { 
				    	  	  return yscale[p].brush.extent(); });
				
				  var selected = [];
				  data
				    .filter(function(d) {
				      return !_.contains(excluded_groups, d.tobe_color);
				    })
				    .map(function(d) {
				    return actives.every(function(p, i) {
				    	var p_new = (yscale[p].ticks)?d[p]:yscale[p](d[p]); 
				      return extents[i][0] <= p_new && p_new <= extents[i][1];
				    }) ? selected.push(d) : null;
				  });
				
				  return selected;
				}
				
				// scale to window size
				window.onresize = function() {
					width = document.getElementById("chart").offsetWidth,
				    height = 240;
				  /*width = 642,
				  height = 240;*/
				
				  w = width - m[1] - m[3],
				  h = height - m[0] - m[2];
				
				  d3.select("#chart")
				      .style("height", (h + m[0] + m[2]) + "px")
				
				  d3.selectAll("canvas")
				      .attr("width", w)
				      .attr("height", h)
				      .style("padding", m.join("px ") + "px");
				
				  d3.select("svg")
				      .attr("width", w + m[1] + m[3])
				      .attr("height", h + m[0] + m[2])
				    .select("g")
				      .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
				  
				  xscale = d3.scale.ordinal().rangePoints([0, w], 1).domain(dimensions);
				  dimensions.forEach(function(d) {
					  console.log("resize d : "+d);
					  if(unqordinalfields.contains(d))
						  {
						  yscale[d].rangePoints([h, 0]);
						  }
					  else
						  {
						  yscale[d].range([h, 0]);
						  }
				  });
				
				  d3.selectAll(".dimension")
				    .attr("transform", function(d) { return "translate(" + xscale(d) + ")"; })
				  // update brush placement
				  d3.selectAll(".brush")
				    .each(function(d) { 
				    	d3.select(this).call(yscale[d].brush = d3.svg.brush().y(yscale[d]).on("brush", brush)); })
				  brush_count++;
				
				  // update axis placement
				  axis = axis.ticks(1+height/50),
				  d3.selectAll(".axis")
				    .each(function(d) { d3.select(this).call(axis.scale(yscale[d])); });
				
				  // render data
				  brush();
				};
				
		}
	}
}];

angular.module("ParallelcordChartApp",[])
		.directive("parallelcordChart", parallelcordDirective)
		.controller("ParallelcordChartController",parallelcordController);
var a = angular.module("a", ["ParallelcordChartApp"]);
