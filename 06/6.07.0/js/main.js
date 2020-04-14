/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    Project 2 + Sec6 interaction
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
    .attr('text-anchor', 'end');

  // 大陸の色のレジェンドを追加
  let legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 10}, ${height - 170})`);

  let continents = ['europe', 'americas', 'asia', 'africa'];
  continents.forEach(
    (ele, i, arr) => {
      let legendRow = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      legendRow.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', color(ele));
      legendRow.append('text')
        .attr('x', -10)
        .attr('y', 10)
        .attr('text-anchor', 'end')
        .style('text-transform', 'capitalize')
        .text(ele);
    }
  );
  //--- レジェンド終了

  // Tooltips
  let decimalFormatter = d3.format('.2f');
  let moneyFormatter = d3.format('$,.0f');
  let popFormatter = d3.format(',.0f');
  let tooltip = d3.tip().attr('class', 'd3-tip') // 'd3-tip' は css ファイルのクラス名
    .html(d => `
      <strong>Country:</strong> <span style='color:red'>${d.country}</span><br>
      <strong>Continent:</strong> <span style='color:red;text-transform:capitalize'>${d.continent}</span><br>
      <strong>Life Expectancy:</strong> <span style='color:red'>${decimalFormatter(d.life_exp)}</span><br>
      <strong>Income:</strong> <span style='color:red'>${moneyFormatter(d.income)}</span><br>
      <strong>Population:</strong> <span style='color:red'>${popFormatter(d.population)}</span><br>
    `);
  svg.call(tooltip);

  const update = aData => {
    // selectに応じて大陸をフィルタリング
    let selectedContinent = $('#continent-select').val();
    let data = { ...aData,
      countries: aData.countries.filter(d => {
        if (selectedContinent === 'all') {
          return true;
        } else {
          return d.continent === selectedContinent;
        }
      })
    };
    // Transition must be instantiated every drawing
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
      .on('mouseover', tooltip.show) // enter時に1回だけtooltip用イベントリスナーをattachする．merge後に実行すると
      .on('mouseout', tooltip.hide) // 既に画面に描画されている要素のデータ更新時にもattachされてしまう．
      // UPDATE old elements together with new elements
      .merge(circles)
      .transition(trn)
      .attr('cx', d => x(d.income))
      .attr('cy', d => y(d.life_exp))
      .attr('r', d => Math.sqrt(r(d.population) / Math.PI))

    // Update the time label
    yearText.text(data.year);
    // Update the slider's year label
    $('#year')[0].innerHTML = data.year;
    $('#date-slider').slider('value', data.year);
  }; // end of update() function

  let time = 0;
  let len = data.length - 1;
  // step function to call update based on the time
  let step = () => {
    time = (time < len) ? time + 1 : 0
    update(data[time]);
  }
  let interval = null;
  // setup the play-pause button
  let playPauseButton = $('#play-button');
  playPauseButton.on('click', () => {
    if (playPauseButton.text() === 'Play') {
      playPauseButton.text('Pause');
      interval = setInterval(step, 100);
    } else {
      playPauseButton.text('Play');
      clearInterval(interval);
    }
  });
  // setup the reset  button
  $('#reset-button').on('click', () => {
    time = 0;
    update(data[0]);
  });
  // pause中にContinentの選択が変更された時のための更新
  $('#continent-select').on('change', () => {
    update(data[time]);
  });
  // Slider setup
  $('#date-slider').slider({
    max: 2014,
    min: 1800,
    step: 1,
    slide: (event, ui) => {
      time = ui.value - 1800;
      update(data[time]);
    }
  });
  update(data[time]);
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
