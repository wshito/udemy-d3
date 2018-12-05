/*
 *    main.js
 *    Mastering Data Visualization with D3.js
 *    3.9 - Margins and groups
 */

var margin = {
    left: 100,
    right: 10,
    top: 10,
    bottom: 100
};

var width = 600 - margin.left - margin.right, // このwidthはマージンを除いた描画領域のwidth
    height = 400 - margin.top - margin.bottom; // このheightはマージンを除いた描画領域のheight

var g = d3.select("#chart-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right) // svgの幅と高さはマージンを含める．
    .attr("height", height + margin.top + margin.bottom)
    .append("g") // マージン分トランスレートしたグループを作成
    .attr("transform", "translate(" + margin.left +
        ", " + margin.top + ")")

d3.json("data/buildings.json").then(function (data) {
    // console.log(data);

    data.forEach(function (d) {
        d.height = +d.height;
    });

    var x = d3.scaleBand() // 離散カテゴリデータから連続地へのマッピング関数
        .domain(data.map(function (d) {
            return d.name;
        }))
        .range([0, width]) // rangeには実際の描画スペースの幅を渡す
        .paddingInner(0.3) // バンド間のスペースを決定する比率
        .paddingOuter(0.3); // 最小バンドと最大バンドの外側のスペースを決定する比率

    var y = d3.scaleLinear() // 連続値から連続値への線形マッピング
        .domain([0, d3.max(data, function (d) {
            return d.height;
        })])
        .range([0, height]); // rangeには実際の描画スペースの高さを渡す

    var rects = g.selectAll("rect")
        .data(data)

    rects.enter()
        .append("rect")
        .attr("y", 0)
        .attr("x", function (d) {
            return x(d.name); // 棒グラフのx座標はBandScaleオブジェクトにカテゴリ名を渡すと位置が得られる．
        })
        .attr("width", x.bandwidth) // scaleBandオブジェクトのバンド幅属性を参照
        .attr("height", function (d) {
            return y(d.height); // y座標は線形変換した値
        })
        .attr("fill", "grey");

})