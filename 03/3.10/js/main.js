/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    3.10 - Axes and labels
 */

var margin = {
    left: 100,
    right: 10,
    top: 10,
    bottom: 150
};

var width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

var g = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")");

// X Label
g.append("text")
    .attr("class", "x axis-label")
    .attr("x", width / 2)
    .attr("y", height + 140)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("The word's tallest buildings");

// Y Label
g.append("text")
    .attr("class", "y axis-label")
    .attr("x", -(height / 2))
    .attr("y", -60)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Height (m)");

d3.json("data/buildings.json").then(function (data) {
    console.log(data);

    data.forEach(function (d) {
        d.height = +d.height;
    });

    var x = d3.scaleBand()
        .domain(data.map(function (d) {
            return d.name;
        }))
        .range([0, width])
        .paddingInner(0.3)
        .paddingOuter(0.3);

    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) {
            return d.height;
        })])
        .range([0, height]);

    var xAxisCall = d3.axisBottom(x); // 軸にはドメイン情報の入ったScaleオブジェクトを渡す
    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxisCall) // 恐らくここでドメインデータがattachされる
        .selectAll("text") // 各ドメインデータに対してtext要素が作成される
        .attr("y", "10") // 軸に作成される要素は自動的にtransformされてtick分だけずれていく．したがって，
        .attr("x", "-5") // この座標値はtickからの相対座標と考えられる．
        .attr("text-anchor", "end") // tickからの相対座標の位置にテキストの右端を合わせる
        .attr("transform", "rotate(-40)");

    var yAxisCall = d3.axisLeft(y) // 軸にはドメイン情報の入ったScaleオブジェクトを渡す
        .ticks(3) // 最小，最大のメモリの間に3つのメモリを作成．
        .tickFormat(function (d) {
            return d + "m";
        });
    g.append("g")
        .attr("class", "y-axis")
        .call(yAxisCall); // ここでスケールオブジェクト内のドメインデータがattachされる

    var rects = g.selectAll("rect")
        .data(data)

    rects.enter()
        .append("rect")
        .attr("y", 0)
        .attr("x", function (d) {
            return x(d.name); // データ名からBandScaleでx座標に変換
        })
        .attr("width", x.bandwidth)
        .attr("height", function (d) {
            return y(d.height); // データ値からLinearScaleでy座標に変換
        })
        .attr("fill", "grey");

})