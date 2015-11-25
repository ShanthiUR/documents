package com.bnym.dgp.metric.web.chart;

import java.util.Map;
import java.util.HashMap;
import java.util.Map.Entry;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.bnym.dgp.util.log.Log;
import com.bnym.dgp.util.log.Logger;

@Controller
@RequestMapping("chart")
public class ParallelcordChartController {

	@Logger
	private Log log;
	
	@RequestMapping("parallelcord")
	public String parallelcordChart(@RequestParam Map<String,String> requestVar, Model model) {
		
		log.info("Parallel Coordinates Chart Controller");
		
		String queryString = "";
		boolean isFilterEnabled = false;
		
		//	- Iterating the values received in request map to build query string 
		for(Entry<String, String> mapObj : requestVar.entrySet()){
			
			if(mapObj.getKey() != null && mapObj.getKey().equalsIgnoreCase("filter"))
				isFilterEnabled = true;
			
			queryString += mapObj.getKey()+"="+mapObj.getValue()+"&";
		}
		
		log.info("Query String formed in Parallel Coordinates Chart Controller ==> "+queryString);
		
		model.addAttribute("queryString",queryString);
		model.addAttribute("filterEnabled",isFilterEnabled);
		
		return "chart/ParallelcordChart"; // - View is in /WEB-INF/view/chart/SemidonutChart.jsp
	}
}
