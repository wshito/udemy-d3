/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    3.13.0 Project 1 - Star Break Coffee
 */

const createSVG = selectorID => margins => (width, height) => {
  return {
    svg: d3.select(selectorID)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margins.left}, ${margins.top})`),
    width: width - margins.left - margins.right,
    height: height - margins.top - margins.bottom,
    margins: margins
  };
};

const readJSON = path => numericPropNames => d3.json(path).then(d => {
  d.forEach(ele => {
    numericPropNames.map(prop => ele[prop] = +ele[prop]); // destructive but safe
    return ele;
  });
  return d;
});

const drawBarChart = svgObj => (fx, fy) => data => {
  let { svg, width, height, margins } = svgObj;
  let labelSize = 20;
  // setup scales
  let x = d3.scaleBand()
    .domain(data.map(fx))
    .range([0, width])
    .paddingInner(0.2)
    .paddingOuter(0.2);
  let y = d3.scaleLinear()
    .domain([0, Math.max(...data.map(fy))])
    .range([height, 0]);
  // x label
  svg.append('text')
    .attr('class', 'x axis-label')
    .attr('x', width / 2)
    .attr('y', height + margins.bottom)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${labelSize}px`)
    .text('Month');
  // y label
  svg.append('text')
    .attr('class', 'y axis-label')
    .attr('x', -height / 2)
    .attr('y', -(margins.left - labelSize))
    .attr('text-anchor', 'middle')
    .attr('font-size', `${labelSize}px`)
    .attr('transform', 'rotate(-90)')
    .text('Revenue');
  // draw x-axis
  let xAxisCall = d3.axisBottom(x)
  svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall)
    .selectAll('text')
    .attr('x', 0)
    .attr('y', 13)
    .attr('text-anchor', 'middle');
  // draw y-axis
  let yAxisCall = d3.axisLeft(y)
    .tickFormat(d => '$' + d);
  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxisCall);
  // draw rectabulars
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(fx(d)))
    .attr('y', d => y(fy(d)))
    .attr('width', x.bandwidth)
    .attr('height', d => height - y(fy(d)))
    .attr('fill', 'grey');
}

const drawCoffeShopBarChart = drawBarChart(
    createSVG('#chart-area')({
      top: 10,
      bottom: 60,
      left: 90,
      right: 10
    })(600, 400))
  (x => x.month, y => y.revenue);

readJSON('data/revenues.json')(['revenue', 'profit']).then(drawCoffeShopBarChart);
