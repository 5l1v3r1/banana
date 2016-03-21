/*! banana-fusion - v1.6.0 - 2016-03-21
 * https://github.com/LucidWorks/banana/wiki
 * Copyright (c) 2016 Andrew Thanalertvisuti; Licensed Apache License */

define("panels/terms/module",["angular","app","underscore","jquery","kbn"],function(a,b,c,d,e){"use strict";var f=a.module("kibana.panels.terms",[]);b.useModule(f),f.controller("terms",["$scope","$timeout","timer","querySrv","dashboard","filterSrv",function(b,f,g,h,i,j){b.panelMeta={modals:[{description:"Inspect",icon:"icon-info-sign",partial:"app/partials/inspector.html",show:b.panel.spyable}],exportfile:!0,editorTabs:[{title:"Queries",src:"app/partials/querySelect.html"}],status:"Stable",description:"Displays the results of a Solr facet as a pie chart, bar chart, or a table. Newly added functionality displays min/max/mean/sum of a stats field, faceted by the Solr facet field, again as a pie chart, bar chart or a table."};var k={queries:{mode:"all",ids:[],query:"*:*",custom:""},mode:"count",field:"",stats_field:"",decimal_points:0,exclude:[],missing:!1,other:!1,size:10,sortBy:"count",order:"descending",style:{"font-size":"10pt"},donut:!1,tilt:!1,labels:!0,logAxis:!1,arrangement:"horizontal",chart:"bar",counter_pos:"above",exportSize:1e4,lastColor:"",spyable:!0,show_queries:!0,error:"",chartColors:h.colors,refresh:{enable:!1,interval:2}};c.defaults(b.panel,k),b.init=function(){b.hits=0,b.panel.refresh.enable&&b.set_timer(b.panel.refresh.interval),b.$on("refresh",function(){b.get_data()}),b.get_data()},b.testMultivalued=function(){return b.panel.field&&b.fields.typeList[b.panel.field]&&b.fields.typeList[b.panel.field].schema.indexOf("M")>-1?void(b.panel.error="Can't proceed with Multivalued field"):b.panel.stats_field&&b.fields.typeList[b.panel.stats_field].schema.indexOf("M")>-1?void(b.panel.error="Can't proceed with Multivalued field"):void 0},b.build_query=function(a,c){var d="";j.getSolrFq()&&(d="&"+j.getSolrFq());var e="&wt="+a,f=c?"&rows=0":"",g="";g="count"===b.panel.mode?"&facet=true&facet.field="+b.panel.field+"&facet.limit="+b.panel.size+"&facet.missing=true":"&stats=true&stats.facet="+b.panel.field+"&stats.field="+b.panel.stats_field+"&facet.missing=true",g+="&f."+b.panel.field+".facet.sort="+(b.panel.sortBy||"count");var i=b.panel.exclude.length,k="";if(i>0)for(var l=0;i>l;l++)""!==b.panel.exclude[l]&&(k+="&fq=-"+b.panel.field+":"+b.panel.exclude[l]);return h.getORquery()+e+f+d+k+g+(null!=b.panel.queries.custom?b.panel.queries.custom:"")},b.exportfile=function(a){var c=this.build_query(a,!0);b.sjs.client.server(i.current.solr.server+i.current.solr.core_name);var d,f=b.sjs.Request().indices(i.indices);f.setQuery(c),d=f.doSearch(),d.then(function(b){e.download_response(b,a,"terms")})},b.set_timer=function(a){b.panel.refresh.interval=a,c.isNumber(b.panel.refresh.interval)?(g.cancel(b.refresh_timer),b.realtime()):g.cancel(b.refresh_timer)},b.realtime=function(){b.panel.refresh.enable?(g.cancel(b.refresh_timer),b.refresh_timer=g.register(f(function(){b.realtime(),b.get_data()},1e3*b.panel.refresh.interval))):g.cancel(b.refresh_timer)},b.get_data=function(){if(0!==i.indices.length){delete b.panel.error,b.panelMeta.loading=!0;var e,f;b.sjs.client.server(i.current.solr.server+i.current.solr.core_name),e=b.sjs.Request().indices(i.indices),b.panel.queries.ids=h.idsByMode(b.panel.queries),b.inspector=a.toJson(JSON.parse(e.toString()),!0);var g=this.build_query("json",!1);b.panel.queries.query=g,e.setQuery(g),f=e.doSearch(),f.then(function(a){if(!c.isUndefined(a.error))return b.panel.error=b.parse_error(a.error.msg),b.data=[],b.panelMeta.loading=!1,void b.$emit("render");var e=function(a){d("#colorTest").removeAttr("style");var b=d("#colorTest").css("color");return d("#colorTest").css("color",a),b!==d("#colorTest").css("color")},f=function(a,c){return b.panel.useColorFromField&&e(c)&&(a.color=c),a},g=0,h=0,i=0;b.panelMeta.loading=!1,b.hits=a.response.numFound,b.data=[],"count"===b.panel.mode?(b.yaxis_min=0,c.each(a.facet_counts.facet_fields,function(a){for(var c=0;c<a.length;c++){var d=a[c];c++;var e=a[c];if(g+=e,null===d)i=e;else{if(0===e)continue;var j={label:d,data:[[h,e]],actions:!0};j=f(j,d),b.data.push(j)}}})):(b.yaxis_min=null,c.each(a.stats.stats_fields[b.panel.stats_field].facets[b.panel.field],function(a,c){var d={label:c,data:[[h,a[b.panel.mode]]],actions:!0};b.data.push(d)})),b.data=c.sortBy(b.data,function(a){return"index"===b.panel.sortBy?a.label:a.data[0][1]}),"descending"===b.panel.order&&b.data.reverse(),b.data=b.data.slice(0,b.panel.size),c.each(b.data,function(a){a.data[0][0]=h,h++}),b.panel.field&&b.fields.typeList[b.panel.field]&&b.fields.typeList[b.panel.field].schema.indexOf("T")>-1&&(b.hits=g),b.data.push({label:"Missing field",data:[[h,i]],meta:"missing",color:"#aaa",opacity:0}),b.data.push({label:"Other values",data:[[h+1,b.hits-g]],meta:"other",color:"#444"}),b.$emit("render")})}},b.build_search=function(a,d){if(c.isUndefined(a.meta))j.set({type:"terms",field:b.panel.field,value:a.label,mandate:d?"mustNot":"must"});else{if("missing"!==a.meta)return;j.set({type:"exists",field:b.panel.field,mandate:d?"must":"mustNot"})}i.refresh()},b.set_refresh=function(a){b.refresh=a,"count"===b.panel.mode&&(b.panel.decimal_points=0)},b.close_edit=function(){b.panel.refresh.enable&&b.set_timer(b.panel.refresh.interval),b.refresh&&b.get_data(),b.refresh=!1,b.$emit("render")},b.showMeta=function(a){return c.isUndefined(a.meta)?!0:"other"!==a.meta||b.panel.other?!("missing"===a.meta&&!b.panel.missing):!1}}]),f.directive("termsChart",["querySrv","dashboard","filterSrv",function(b,f,g){return{restrict:"A",link:function(b,h){function i(){var a,e,f=[];h.css({height:b.panel.height||b.row.height}),e=c.clone(b.data),e=b.panel.missing?e:c.without(e,c.findWhere(e,{meta:"missing"})),e=b.panel.other?e:c.without(e,c.findWhere(e,{meta:"other"})),g.idsByTypeAndField("terms",b.panel.field).length>0?f.push(b.panel.lastColor):f=b.panel.chartColors,require(["jquery.flot.pie"],function(){try{if("bar"===b.panel.chart){var g={show:!0,min:b.yaxis_min,color:"#c8c8c8"};b.panel.logAxis&&c.defaults(g,{ticks:function(a){var b,c=[],d=1,e=8,f=0===a.max?0:Math.log(a.max),g=0===a.min?0:Math.log(a.min),h=(f-g)/e;do b=h*d,c.push(Math.exp(b)),++d;while(f>b);return c},transform:function(a){return 0===a?0:Math.log(a)},inverseTransform:function(a){return 0===a?0:Math.exp(a)}}),a=d.plot(h,e,{legend:{show:!1},series:{lines:{show:!1},bars:{show:!0,fill:1,barWidth:.8,horizontal:!1},shadowSize:1},yaxis:g,xaxis:{show:!1},grid:{borderWidth:0,borderColor:"#eee",color:"#eee",hoverable:!0,clickable:!0},colors:f})}if("pie"===b.panel.chart){var i=function(a,b){return"<div ng-click=\"build_search(panel.field,'"+a+'\') "style="font-size:8pt;text-align:center;padding:2px;color:white;">'+a+"<br/>"+Math.round(b.percent)+"%</div>"};a=d.plot(h,e,{legend:{show:!1},series:{pie:{innerRadius:b.panel.donut?.4:0,tilt:b.panel.tilt?.45:1,radius:1,show:!0,combine:{color:"#999",label:"The Rest"},stroke:{width:0},label:{show:b.panel.labels,radius:2/3,formatter:i,threshold:.1}}},grid:{hoverable:!0,clickable:!0},colors:f})}h.is(":visible")&&setTimeout(function(){b.legend=a.getData(),b.$$phase||b.$apply()})}catch(j){h.text(j)}})}b.$on("render",function(){i()}),a.element(window).bind("resize",function(){i()}),h.bind("plotclick",function(a,c,d){d&&(b.build_search(b.data[d.seriesIndex]),b.panel.lastColor=d.series.color)});var j=d("<div>");h.bind("plothover",function(a,c,d){if(d){var g="bar"===b.panel.chart?d.datapoint[1]:d.datapoint[1][0][1];j.html(e.query_color_dot(d.series.color,20)+" "+d.series.label+" ("+f.numberWithCommas(g.toFixed(b.panel.decimal_points))+")").place_tt(c.pageX,c.pageY)}else j.remove()})}}}])});