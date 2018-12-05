/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    2.8 - Activity: Your first visualization!
 */

d3.json('data/buildings.json').then(data => {
    data.forEach(d => d.height = +d.height);

    let svg = d3.select('#chart-area').append('svg')
        .attr('width', 500)
        .attr('height', 500);

    let rect = svg.selectAll('rect').data(data);

    rect.enter()
        .append('rect')
        .attr('x', (d, i) => i * 25)
        .attr('y', 0)
        .attr('width', 20)
        .attr('height', d => d.height)
        .attr('fill', 'grey');
});