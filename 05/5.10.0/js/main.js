/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 2 - Gapminder Clone
 */
// Clean data
const formatData = data => data.map(year => {
  return {
    countries: year["countries"].filter(country =>
      country.income && country.life_exp && country.population
    ).map(country => {
      return { ...country,
        income: +country.income,
        life_exp: +country.life_exp,
        population: +country.population
      };
    }),
    year: year.year
  };
});

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

const getDomain = data => {
  console.log(data);
  const initMinMax = { pop_max: 0, pop_min: Infinity, income_max: 0, income_min: Infinity, life_exp: 0 };
  let found = false;
  const minMax = (acc, d) => {
    if (d.population && d.population > 0) {
      acc.pop_max = Math.max(acc.pop_max, d.population);
      acc.pop_min = Math.min(acc.pop_min, d.population);
    }
    if (d.income && d.income > 0) {
      acc.income_max = Math.max(acc.income_max, d.income);
      acc.income_min = Math.min(acc.income_min, d.income);
    }
    if (d.life_exp) acc.life_exp = Math.max(acc.life_exp, d.life_exp);
    return acc;
  };
  let maxArr = data.map(annual => annual.countries.reduce(minMax, initMinMax));
  return maxArr[maxArr.length - 1];
};
const area = r => r * r * Math.PI;

const drawBubbleChart = svgObj => data => {
  let { svg, width, height, margins } = svgObj;
  let labelSize = 20;
  let domain = getDomain(data);
  console.log(domain);
  // setup scales
  let r = d3.scaleLinear()
    .domain([domain.pop_min, domain.pop_max])
    .range([area(5), area(40)]);
  let color = d3.scaleOrdinal(d3.schemeSet1);
  // X scalee
  let x = d3.scaleLog()
    .range([0, width]) // domainはupdate関数内で設定
    .domain([domain.income_min, domain.income_max]);
  // Y scale
  let y = d3.scaleLinear()
    .range([height, 0]) // domainはupdate関数内で設定
    .domain([0, domain.life_exp]);
  // x label
  svg.append('text')
    .attr('class', 'x axis-label')
    .attr('x', width / 2)
    .attr('y', height + margins.bottom)
    .attr('text-anchor', 'middle')
    .attr('font-size', `${labelSize}px`)
    .text('GDP per Capita ($)');
  // y label
  let yLabel = svg.append('text')
    .attr('class', 'y axis-label')
    .attr('x', -height / 2)
    .attr('y', -(margins.left - labelSize))
    .attr('text-anchor', 'middle')
    .attr('font-size', `${labelSize}px`)
    .attr('transform', 'rotate(-90)')
    .text('Life Expectancy (Years)');
  // Setup X-Axis
  let xAxisCall = d3.axisBottom(x)
    .tickValues([400, 4000, 40000])
    .tickFormat(d3.format('$'));
  let xAxisGroup = svg.append('g')
    .attr('class', 'x axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxisCall)
    .selectAll('text') // 描画後tickのラベルを修正
    .attr('x', 0)
    .attr('y', 13)
    .attr('text-anchor', 'middle');
  // Setup Y-Axis
  let yAxisCall = d3.axisLeft(y);
  let yAxisGroup = svg.append('g')
    .attr('class', 'y axis')
    .call(yAxisCall);

  let yearText = svg.append('text')
    .attr('x', width - 5)
    .attr('y', height - 20)
    .attr('font-size', '40px')
    .attr('opacity', 0.4)
    .attr('text-anchor', 'end')

  const update = data => {
    // draw rectabulars
    let trn = d3.transition().duration(50);
    // JOIN new data with old elements
    let circles = svg.selectAll('circle')
      .data(data.countries, d => d.country);

    // EXIT old elements present in new data
    circles.exit()
      .attr("class", "exit")
      .remove();

    // UPDATE old elements in new data

    // ENTER new elements present in new data.
    circles.enter()
      .append('circle')
      .attr("class", "enter")
      .attr('fill', d => color(d.continent))
      //.attr('fill-opacity', 0.7)
      // UPDATE old elements together with new elements
      .merge(circles)
      .transition(trn)
      .attr('cx', d => x(d.income))
      .attr('cy', d => y(d.life_exp))
      .attr('r', d => Math.sqrt(r(d.population) / Math.PI))

    yearText.text(data.year);
  };
  let i = 0;
  let len = data.length - 1;
  d3.interval(() => {
    i = (i < len) ? i + 1 : 0;
    update(data[i]);
  }, 100);
  update(data[i]);
};

const drawLifeExpBubbleChart = drawBubbleChart(
  createSVG('#chart-area')({
    top: 10,
    bottom: 60,
    left: 70,
    right: 40
  })(800, 500));

// population per capita, life expectancy, countries, years, continent
d3.json("data/data.json").then(formatData).then(drawLifeExpBubbleChart);
