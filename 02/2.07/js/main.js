/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    2.7 - Loading external data
 */

d3.csv("data/ages.csv").then(data => {
    // 読み込んだデータの数値を文字列から変換
    data.forEach(d => d.age = +d.age);

    // svg要素を作成
    var svg = d3.select("#chart-area").append("svg")
        .attr("width", 400)
        .attr("height", 400);

    // 読み込んだデータを用いてcircle要素を作成
    var circles = svg.selectAll("circle")
        .data(data);

    circles.enter()
        .append("circle")
        .attr("cx", function (d, i) {
            console.log(d);
            return (i * 50) + 25;
        })
        .attr("cy", 25)
        .attr("r", function (d) {
            return d.age * 2;
        })
        .attr("fill", function (d) {
            if (d.name == "Tony") {
                return "blue";
            } else {
                return "red";
            }
        });
}).catch(function (error) {
    console.log(error);
});