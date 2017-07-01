function chart(ontology, conceptUri)
{
  $( '#chart' ).empty();
  $( "#tableBody" ).empty();
  // loader settings
  var opts = {
    lines: 9, // The number of lines to draw
    length: 9, // The length of each line
    width: 5, // The line thickness
    radius: 14, // The radius of the inner circle
    color: '#EE3124', // #rgb or #rrggbb or array of colors
    speed: 1.9, // Rounds per second
    trail: 40, // Afterglow percentage
    className: 'spinner', // The CSS class to assign to the spinner
  };
  var spinner = new Spinner(opts).spin(document.getElementById("chart"));
  var outerRadius = 700 / 2,
      innerRadius = outerRadius - 170;

  var initialTransform = d3.zoomIdentity
    .translate(0,0)
    .scale(1);

  var color = d3.scaleOrdinal()
      .domain(["low", "middle", "high"])
      .range(d3.schemeCategory10);

  var svg = d3.select("#chart").append("svg")
      .attr("style", "display: block; margin:auto;")
      .attr("width", outerRadius * 2)
      .attr("height", outerRadius * 2);

  // Define the div for the tooltip
  var div = d3.select("body").append("div") 
      .attr("class", "tooltip")       
      .style("opacity", 0);

/*  var legend = svg.append("g")
      .attr("class", "legend")
    .selectAll("g")
    .data(color.domain())
    .enter().append("g")
    .attr("transform", function(d, i) { return "translate(" + (outerRadius * 2 - 10) + "," + (i * 20 + 10) + ")"; });

  legend.append("rect")
      .attr("x", -18)
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color);

  legend.append("text")
      .attr("x", -24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .attr("text-anchor", "end")
      .text(function(d) { return d; });*/

  var chart = svg.append("g")
      .attr("transform", "translate(" + 350 + "," + 250 + ")");

  var zoom = d3.zoom()
      .scaleExtent([1 / 2, 8])
      .on("zoom", zoomed);

  function zoomed() {
    var zoomEvent = d3.event.transform;
    chart.attr("transform", d3.event.transform);
  }

  function dragged(d) {
    d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
  }

  d3.json("http://bioteaexplorer.service.labs.linkingdata.io/cluster?ontology=" + ontology + "&concept=" + conceptUri, function(error, data) {
    if (error) throw error;
    spinner.stop();
    for (i = 1; i <= Object.keys(data['flat']).length; i++) {
      var cluster_data =  data['flat'][i];
      var articles = "";
      cluster_data['articles'].forEach(function(article){
        articles += '<a target="_blank" href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC' + article + '">' + article + '</a>, '
      });
      var annotations = "";
      cluster_data['annotations'].forEach(function(annotation){
        annotations += '<a target="_blank" href="' + annotation['uri'] + '">' + annotation['label'] + '</a>, '
      });
      articles = "<td>" + articles + "</td>"
      annotations = "<td>" + annotations + "</td>"
      $("#tableBody").append("<tr><td>"+ i + "</td>" + articles + annotations + "</tr>");
    }
    var root = d3.hierarchy(data['tree'], function(d) { return d.branchset; })
        .sum(function(d) { return d.branchset ? 0 : 1; })
        .sort(function(a, b) { return (b.value - a.value) || d3.descending(a.data.length, b.data.length); });

    var factor = Math.ceil(root.leaves().length / 180);
    if (factor>1) {
      $("#zoomAlert").show();
    } else {
      $("#zoomAlert").hide();
    }
    outerRadius = outerRadius * factor;
    innerRadius = outerRadius - 170;
    var cluster = d3.cluster()
        .size([360, innerRadius])
        .separation(function(a, b) { return 1; });

    cluster(root);

    /*var input = d3.select("#show-length input").on("change", changed),
        timeout = setTimeout(function() { input.property("checked", true).each(changed); }, 2000);*/

    setRadius(root, root.data.length = 0, innerRadius / maxLength(root));
    setColor(root);

  /*  var linkExtension = chart.append("g")
        .attr("class", "link-extensions")
      .selectAll("path")
      .data(root.links().filter(function(d) { return !d.target.children; }))
      .enter().append("path")
        .each(function(d) { d.target.linkExtensionNode = this; })
        .attr("d", linkExtensionConstant);*/

    var link = chart.append("g")
        .attr("class", "links")
      .selectAll("path")
      .data(root.links())
      .enter().append("path")
        .each(function(d) { d.target.linkNode = this; })
        .attr("d", linkConstant)
        .attr("stroke", function(d) { return d.target.color; })
        .attr("stroke-width", 2);

    chart.append("g")
        .attr("class", "labels")
      .selectAll("text")
      .data(root.leaves())
      .enter().append("text")
        .attr("dy", ".31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (innerRadius + 4) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return d.data.name.replace(/_/g, " "); })
        .on("mouseover", mouseovered(true))
        .on("mouseout", mouseovered(false))
        .style('fill', function(d) { return d.color; })
        .on("click", function(d) { window.open("https://www.ncbi.nlm.nih.gov/pmc/articles/PMC" + d.data.name); });
    if (factor > 1) {
      zoom.scaleTo(svg, 1/2);
      svg.call(zoom);
    }
    function changed() {
      clearTimeout(timeout);
      var t = d3.transition().duration(750);
      linkExtension.transition(t).attr("d", this.checked ? linkExtensionVariable : linkExtensionConstant);
      link.transition(t).attr("d", this.checked ? linkVariable : linkConstant);
    }

    function mouseovered(active) {
      return function(d) {
        if(active){
          div.transition()    
              .duration(200)    
              .style("opacity", .9);    
          div .html(d.data.title)  
              .style("left", (d3.event.pageX) + "px")   
              .style("top", (d3.event.pageY + 28) + "px");
          d3.select(this).classed("label--active", active);
        } else {
          div.transition()    
              .duration(500)    
              .style("opacity", 0);
        }
        d3.select(this).classed("label--active", active);
        d3.select(d.linkExtensionNode).classed("link-extension--active", active).each(moveToFront);
        do d3.select(d.linkNode).classed("link--active", active).each(moveToFront); while (d = d.parent);
      };
    }

    function moveToFront() {
      this.parentNode.appendChild(this);
    }
  });

  // Compute the maximum cumulative length of any node in the tree.
  function maxLength(d) {
    return d.data.length + (d.children ? d3.max(d.children, maxLength) : 0);
  }

  // Set the radius of each node by recursively summing and scaling the distance from the root.
  function setRadius(d, y0, k) {
    d.radius = (y0 += d.data.length) * k;
    if (d.children) d.children.forEach(function(d) { setRadius(d, y0, k); });
  }

  // Set the color of each node by recursively inheriting.
  function setColor(d) {
    var name = d.data.name;
    colorValue = 'low';
    similarity = 1 - d.data.length;
    if(similarity > 0.33 && similarity < 0.66)
    {
      colorValue = 'middle';
    } else if (similarity > 0.66){
      colorValue = 'high';
    }
    d.color = color(colorValue);
    //d.color = colorScale(1 - d.data.length);
    if (d.children) d.children.forEach(setColor);
  }

  function linkVariable(d) {
    return linkStep(d.source.x, d.source.radius, d.target.x, d.target.radius);
  }

  function linkConstant(d) {
    return linkStep(d.source.x, d.source.y, d.target.x, d.target.y);
  }

  function linkExtensionVariable(d) {
    return linkStep(d.target.x, d.target.radius, d.target.x, innerRadius);
  }

  function linkExtensionConstant(d) {
    return linkStep(d.target.x, d.target.y, d.target.x, innerRadius);
  }

  // Like d3.svg.diagonal.radial, but with square corners.
  function linkStep(startAngle, startRadius, endAngle, endRadius) {
    var c0 = Math.cos(startAngle = (startAngle - 90) / 180 * Math.PI),
        s0 = Math.sin(startAngle),
        c1 = Math.cos(endAngle = (endAngle - 90) / 180 * Math.PI),
        s1 = Math.sin(endAngle);
    return "M" + startRadius * c0 + "," + startRadius * s0
        + (endAngle === startAngle ? "" : "A" + startRadius + "," + startRadius + " 0 0 " + (endAngle > startAngle ? 1 : 0) + " " + startRadius * c1 + "," + startRadius * s1)
        + "L" + endRadius * c1 + "," + endRadius * s1;
  }
}
