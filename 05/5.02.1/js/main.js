/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    5.02.1 derived from Project 1 in 3.13.0
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

const drawBarChart = svgObj => (fx, yObj) => data => {
  let { svg, width, height, margins } = svgObj;
  let labelSize = 20;
  let flag = false;
  // setup scales
  // X scalee
  let x = d3.scaleBand()
    .range([0, width]) // domainはupdate関数内で設定
    .paddingInner(0.2)
    .paddingOuter(0.2);
  // Y scale
  let y = d3.scaleLinear()
    .range([height, 0]); // domainはupdate関数内で設定
  // x label
  svg.append('text')
    .attr('class', 'x axis-label')
    .attr('x', width / 2)
    .attr('y', height + margins.bottom)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${labelSize}px`)
    .text('Month');
  // y label
  let yLabel = svg.append('text')
    .attr('class', 'y axis-label')
    .attr('x', -height / 2)
    .attr('y', -(margins.left - labelSize))
    .attr('text-anchor', 'middle')
    .attr('font-size', `${labelSize}px`)
    .attr('transform', 'rotate(-90)');
  // Setup X-Axis
  let xAxisGroup = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`);

  // Setup Y-Axis
  let yAxisGroup = svg.append('g')
    .attr('class', 'y axis')
  // draw rectabulars

  let trn = d3.transition().duration(500);

  const update = (data) => {
    fy = flag ? yObj.revenue : yObj.profit;
    x.domain(data.map(fx));
    y.domain([0, Math.max(...data.map(fy))]);
    // draw x-axis
    let xAxisCall = d3.axisBottom(x)
    xAxisGroup.transition(trn).call(xAxisCall)
      .selectAll('text') // 描画後tickのラベルを修正
      .attr('x', 0)
      .attr('y', 13)
      .attr('text-anchor', 'middle');
    // draw y-axis
    let yAxisCall = d3.axisLeft(y)
      .tickFormat(d => '$' + d);
    yAxisGroup.transition(trn).call(yAxisCall);

    // JOIN new data with old elements
    let rects = svg.selectAll('rect')
      .data(data, d => d.month);

    // EXIT old elements present in new data
    rects.exit()
      .attr('fill', 'red')
      .transition(trn)
      .attr('y', y(0))
      .attr('height', 0)
      .remove();

    // UPDATE old elements in new data
    /*
    rects.transition(trn)
      .attr('x', d => x(fx(d)))
      .attr('y', d => y(fy(d)))
      .attr('width', x.bandwidth)
      .attr('height', d => height - y(fy(d)))
    */
    // ENTER new elements present in new data.
    rects.enter()
      .append('rect')
      .attr('x', d => x(fx(d)))
      .attr('y', y(0))
      .attr('height', 0)
      .attr('fill', 'grey')
      .attr('fill-opacity', 0)
      // UPDATE old elements together with new elements
      .merge(rects)
      .transition(trn)
      .attr('x', d => x(fx(d)))
      .attr('y', d => y(fy(d)))
      .attr('width', x.bandwidth)
      .attr('height', d => height - y(fy(d)))
      .attr('fill-opacity', 1);

    let label = flag ? "Revenue" : "Profit";
    yLabel.text(label);

  };

  d3.interval(() => {
    let newData = flag ? data : data.slice(1);
    update(newData);
    flag = !flag;

  }, 1000);
  update(data);


}

const drawCoffeShopBarChart = drawBarChart(
    createSVG('#chart-area')({
      top: 10,
      bottom: 60,
      left: 90,
      right: 10
    })(600, 400))
  (x => x.month, { revenue: y => y.revenue, profit: y => y.profit });

readJSON('data/revenues.json')(['revenue', 'profit']).then(drawCoffeShopBarChart);
