
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 50,
    right: 20,
    bottom: 120,
    left: 120
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

function xScale(cityData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(cityData, d => d[chosenXAxis]) * 0.8,
        d3.max(cityData, d => d[chosenXAxis]) * 1.1])
        .range([0, width]);
    return xLinearScale;
}

function yScale(cityData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(cityData, d => d[chosenYAxis]) * 0.8,
        d3.max(cityData, d => d[chosenYAxis]) * 1.1])
        .range([height, 0]);
    return yLinearScale;
}

function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
    textGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]))
        .attr("y", d => newYScale(d[chosenYAxis]));
    return textGroup;
}

function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var xlabel;
    var ylabel;

    if (chosenXAxis === "poverty") {
        xlabel = "Poverty (%)";
    }
    else if (chosenXAxis === "income") {
        xlabel = "Household Income (Median):";
    }
    else {
        xlabel = "Age (Median):";
    }

    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare (%)";
    }
    else if (chosenYAxis === "obesity") {
        ylabel = "Obesity (%)";
    }
    else {
        ylabel = "Smokes (%)";
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(d => { return `${d.state}<br>${xlabel} ${d[chosenXAxis], chosenXAxis}<br>${ylabel} ${d[chosenYAxis], chosenYAxis1}` });

    circlesGroup.call(toolTip);
    circlesGroup.on("mouseover", data => { toolTip.show(data) })
        .on("mouseout", data => { toolTip.hide(data) });
    return circlesGroup;
}

d3.csv("assets/data/data.csv").then((cityData, err) => {
    if (err) throw err;
    cityData.forEach(data => {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
        data.age = +data.age;
    });
    console.log(cityData);

    var xLinearScale = xScale(cityData, chosenXAxis);
    var yLinearScale = yScale(cityData, chosenYAxis);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var yAxis = chartGroup.append("g")
        .call(leftAxis);
    var xAxis = chartGroup.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    var dot = chartGroup.selectAll("circle")
        .data(cityData)
        .enter()
        .append("circle")
        .classed("stateCircle", true)
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d.healthcare))
        .attr("r", 8);

    var textGroup = chartGroup.selectAll('.stateText')
        .data(cityData)
        .enter()
        .append('text')
        .classed('stateText', true)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d[chosenYAxis]))
        .attr('dy', 3)
        .attr('font-size', '7px')
        .text(d => d.abbr);

    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("aText", true)
        .classed("active", true)
        .text("In Poverty (%)");

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("aText", true)
        .classed("inactive", true)
        .text("Age (Median)");

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("aText", true)
        .classed("inactive", true)
        .text("Household Income (Median)");

    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${0 - margin.left / 4}, ${height / 2})`);

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -20)
        .attr("value", "healthcare")
        .attr("transform", "rotate(-90)")
        .classed("aText", true)
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -40)
        .attr("value", "smokes")
        .attr("transform", "rotate(-90)")
        .classed("aText", true)
        .classed("inactive", true)
        .text("Smokes (%)");

    var obesityLabel = ylabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", -60)
        .attr("value", "obesity")
        .attr("transform", "rotate(-90)")
        .classed("aText", true)
        .classed("inactive", true)
        .text("Obese (%)");


    var dot = updateToolTip(chosenXAxis, chosenYAxis, dot);

    xlabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                chosenXAxis = value;
                xLinearScale = xScale(cityData, chosenXAxis);
                xAxis = renderXAxis(xLinearScale, xAxis);
                dot = renderCircles(dot, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                dot = updateToolTip(chosenXAxis, chosenYAxis, dot);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });

    ylabelsGroup.selectAll("text")
        .on("click", function () {
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                chosenYAxis = value;

                yLinearScale = yScale(cityData, chosenYAxis);
                yAxis = renderYAxis(yLinearScale, yAxis);
                dot = renderCircles(dot, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                dot = updateToolTip(chosenXAxis, chosenYAxis, dot);
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                if (chosenYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "smokes") {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obesityLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obesityLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }
            }
        });
});