//Fetching data
const req = new XMLHttpRequest();
req.open("GET",'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json',true);
req.send();
req.onload = function(){
const json = JSON.parse(req.responseText);
dataset = json

// Define the dimensions
const w = 1000;
const h = 500;
const padding = 70;
const rectSize = 18;
  
// Create scales
const xScale = d3.scaleUtc()
.domain([d3.timeYear.offset(d3.min(dataset, d => parseYear(d.Year)), -1), d3.timeYear.offset(d3.max(dataset, d => parseYear(d.Year)))])
       .range([padding, w - padding]);

const yScale = d3.scaleTime()
       .domain([d3.max(dataset, d => parseTime(d.Time)), d3.min(dataset, d => parseTime(d.Time))])
       .range([h - padding, padding])

// Create SVG container
const svg = d3.select(".container")
       .append("svg")
       .attr("width", w)
       .attr("height", h)

// Create and append y-axis
const xAxis = d3.axisBottom(xScale).ticks(d3.timeYear.every(2)).tickFormat(d3.timeFormat('%Y'));
svg.append("g")
       .attr('id', 'x-axis')
       .attr("transform", `translate(0,${h - padding})`)
       .call(xAxis);

// Add x-axis label
svg.append("text")
    .attr("y", h - padding / 3)
    .attr("x", (w - padding)/2)
    .style("font-size", "1em")
    .style("font-family", "Arial")
    .style("text-anchor", "start")
    .text("Year");


// Create and append y-axis
let firstTick = "37:00";
let timeArr = new Array(12).fill(parseTime(firstTick).getTime());
let customTick = timeArr .map((t,i) => new Date(t + i*15000));
const yAxis = d3.axisLeft(yScale).tickValues(customTick).tickFormat(d3.timeFormat('%M:%S'));
svg.append('g')
       .attr('id', 'y-axis')
       .attr('transform', `translate(${padding},0)`)
       .call(yAxis);

// Add y-axis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0 - ((h - padding) / 2))
    .attr("dy", "1.5em")
    .style("font-size", "1em")
    .style("font-family", "Arial")
    .style("text-anchor", "middle")
    .text("Time in Minutes");
 
// Define a color scale
let [doping, noDoping] = ["No doping allegations", "Riders with doping allegations"]
const colorScale = d3.scaleOrdinal()
  .domain([doping, noDoping])
  .range(["red", "green"]);

// Create plots
svg.selectAll('circle')
       .data(dataset)
       .enter()
       .append('circle')
       .attr('cx', d => xScale(parseYear(d.Year)))
       .attr('cy', d => yScale(parseTime(d.Time)))
       .attr('r', '6')
       .attr('class', 'dot')
       .attr('data-xvalue',d => d.Year)
       .attr('data-yvalue',d => parseTime(d.Time))
       .attr('fill', d => d.Doping? colorScale(doping): colorScale(noDoping))
       .on("mouseover", function(event, d) {
              let dataYear = this.getAttribute('data-xvalue')
              let dataDate = event.target.id
              d3.select("#tooltip")
                  .style("opacity", 1)
                  .style("z-index", 0)
                  .attr('data-year', dataYear)
                  .html(`${d.Name} : ${d.Nationality}<br>Year: ${d.Year}, Time: ${d.Time}<br>${d.Doping? '<br>' + d.Doping: ""}`)
                  .style("left", `${event.pageX + 15}px`)
                  .style("top", `${event.pageY - 30}px`)
          })
       .on("mouseout", function() {
       d3.select("#tooltip")
              .style("opacity", 0)
              .style("z-index", -1)
       });

// Add legend
const legend = svg.append("g")
                     .attr("id", "legend")
                     
const legendItem = legend.selectAll("g")
       .data(colorScale.domain())
       .enter()
       .append('g')
       .attr("class", "legend-label")

legendItem.append('rect')
       .attr('x', w - padding - rectSize)
       .attr('y', (d,i) => (h - padding) / 2 + i * (rectSize + 2))
       .attr('width', `${rectSize}px`)
       .attr('height', `${rectSize}px`)
       .attr('fill', d => colorScale(d))
       
legendItem.append('text')
       .attr('x', w - padding - rectSize)
       .attr('y', (d,i) => (h - padding) / 2 + i * (rectSize + 2))
       .attr("dx", "-0.5em")
       .attr("dy", "1.1em")
       .style("text-anchor", "end")
       .text(d => d) 
}


const parseYear= d3.timeParse("%Y");
const parseTime= d3.timeParse("%M:%S");

