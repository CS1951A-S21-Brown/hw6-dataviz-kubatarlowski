// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = { top: 40, right: 100, bottom: 40, left: 175 };

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
const graph_1_width = MAX_WIDTH / 2 - 10,
  graph_1_height = 575;
const graph_2_width = MAX_WIDTH / 2 - 10,
  graph_2_height = (575 * 3) / 4;
const graph_3_width = MAX_WIDTH / 2 - 10,
  graph_3_height = (575 * 3) / 4;

const radius = Math.min(graph_1_width, graph_1_height) / 2.5;

const color = d3.scaleOrdinal().range(d3.schemeTableau10);

const svgGraphOne = d3
  .select("#graph1")
  .append("svg")
  .attr("width", graph_1_width)
  .attr("height", graph_1_height)
  .append("g")
  .attr(
    "transform",
    "translate(" + graph_1_width / 2 + "," + graph_1_height / 2 + ")"
  );

const NUM_EXAMPLES = 10;

d3.csv("data/video_games.csv").then((data) => {
  data = data
    .sort((a, b) => {
      return parseFloat(b.Global_Sales) - parseFloat(a.Global_Sales);
    })
    .slice(0, NUM_EXAMPLES);

  const pie = d3
    .pie()
    .value((d) => {
      if (d.value) {
        return d.value.Global_Sales;
      }
    })
    .sort((a, b) => d3.ascending(a.key, b.key));

  const pieData = pie(d3.entries(data));
  const arcGenerator = d3.arc().innerRadius(0).outerRadius(radius);

  const path = svgGraphOne.selectAll("path").data(pieData);

  path
    .enter()
    .append("path")
    .merge(path)
    .attr("d", arcGenerator)
    .attr("fill", (d) => color(d.data.key));

  path
    .enter()
    .append("text")
    .text((d) => `${d.data.value.Global_Sales} MM`)
    .attr("transform", (d) => {
      const cent = arcGenerator.centroid(d);
      cent[0] = cent[0] * 1.2;
      cent[1] = cent[1] * 1.2;
      return "translate(" + cent + ")";
    })
    .style("text-anchor", "middle")
    .style("font-size", "16px");

  const legend = svgGraphOne
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", (_, i) => `translate(${250}, ${i * 15 - 30})`)
    .attr("class", "legend");

  legend
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (_, i) => color(i));

  legend
    .append("text")
    .text((d) => d.Name)
    .style("font-size", 12)
    .attr("y", 10)
    .attr("x", 11);
});

svgGraphOne
  .append("text")
  .text("Top 10 Video Games of All Time by Copies Sold")
  .attr("transform", `translate(-260,-250)`)
  .style("font-size", "24px");

const svgGraphTwo = d3
  .select("#graph2")
  .append("svg")
  .attr("width", graph_2_width)
  .attr("height", graph_2_height)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

const titleTwo = svgGraphTwo
  .append("text")
  .attr(
    "transform",
    `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${-20})`
  )
  .style("text-anchor", "middle")
  .text("Most Popular Genres by Region")
  .style("font-size", "24px");

d3.csv("data/video_games.csv").then((data) => {
  data = cleanDataGraphTwo(data);

  const regions = ["NA_Sales", "EU_Sales", "JP_Sales", "Other_Sales"];

  const x = d3
    .scaleBand()
    .domain(data.map((d) => d.Genre))
    .range([0, graph_2_width - margin.left - margin.right])
    .padding(0.2);

  svgGraphTwo
    .append("g")
    .attr(
      "transform",
      `translate(0, ${graph_2_height - margin.top - margin.bottom})`
    )
    .call(d3.axisBottom(x).tickSize(0).tickPadding(10));

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => parseFloat(d.NA_Sales))])
    .range([graph_2_height - margin.top - margin.bottom, 0]);

  svgGraphTwo.append("g").call(d3.axisLeft(y).tickSize(10).tickPadding(10));

  const region = d3
    .scaleBand()
    .domain(regions)
    .range([0, x.bandwidth()])
    .padding(0.05);

  const color = d3.scaleOrdinal().domain(regions).range(d3.schemeTableau10);

  svgGraphTwo
    .append("g")
    .selectAll("g")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${x(d.Genre)}, 0)`)
    .selectAll("rect")
    .data((d) => regions.map((key) => ({ key: key, value: d[key] })))
    .enter()
    .append("rect")
    .attr("x", (d) => region(d.key))
    .attr("y", (d) => y(d.value))
    .attr("width", region.bandwidth())
    .attr(
      "height",
      (d) => graph_2_height - margin.top - margin.bottom - y(d.value)
    )
    .attr("fill", (val) => color(val.key));

  svgGraphTwo
    .append("text")
    .attr(
      "transform",
      `translate(-150, ${(graph_2_height - margin.top - margin.bottom) / 2})`
    )
    .text("Sales (millions)")
    .style("font-size", 12);

  svgGraphTwo
    .append("text")
    .attr(
      "transform",
      `translate(${(graph_2_width - margin.left - margin.right) / 2}, ${
        graph_2_height - margin.top - margin.bottom + 37
      })`
    )
    .style("text-anchor", "middle")
    .style("font-size", 16)
    .text("Genres");

  const legend = svgGraphTwo
    .selectAll(".legend")
    .data(regions)
    .enter()
    .append("g")
    .attr(
      "transform",
      (d, i) =>
        `translate(${graph_2_width - margin.left - margin.right}, ${
          i * 15 + 30
        })`
    )
    .attr("class", "legend");

  legend
    .append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", (d, i) => color(d));

  legend
    .append("text")
    .text((d) => d)
    .style("font-size", 11)
    .attr("y", 10)
    .attr("x", 11);
});

const cleanDataGraphTwo = (data) => {
  const genres = {};

  Object.values(data).forEach((game) => {
    if (game.Genre === undefined) {
      return;
    }

    game.Genre in genres
      ? (genres[game.Genre] = {
          Genre: game.Genre,
          NA_Sales: genres[game.Genre].NA_Sales + parseFloat(game.NA_Sales),
          EU_Sales: genres[game.Genre].EU_Sales + parseFloat(game.EU_Sales),
          JP_Sales: genres[game.Genre].JP_Sales + parseFloat(game.JP_Sales),
          Other_Sales:
            genres[game.Genre].Other_Sales + parseFloat(game.Other_Sales),
        })
      : (genres[game.Genre] = {
          Genre: game.Genre,
          NA_Sales: parseFloat(game.NA_Sales),
          EU_Sales: parseFloat(game.EU_Sales),
          JP_Sales: parseFloat(game.JP_Sales),
          Other_Sales: parseFloat(game.Other_Sales),
        });
  });

  const res = Object.values(genres).map((val) => {
    if (val !== undefined && val.Genre !== undefined) {
      return val;
    }
  });

  return res;
};

const svgGraphThree = d3
  .select("#graph3")
  .append("svg")
  .attr("width", graph_3_width)
  .attr("height", graph_3_height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const x = d3
  .scaleBand()
  .range([0, graph_3_width - margin.left - margin.right])
  .padding(0.1);

const y = d3.scaleLinear().range([graph_3_height, 0]);

const y_axis_label = svgGraphThree.append("g");
const x_axis_label = svgGraphThree
  .append("g")
  .attr(
    "transform",
    `translate(0, ${graph_3_height - margin.top - margin.bottom + 80})`
  );

svgGraphThree
  .append("text")
  .attr(
    "transform",
    `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${
      graph_3_height - margin.top - margin.bottom + 115
    })`
  )
  .style("text-anchor", "middle")
  .text("Publishers");

const y_axis_text = svgGraphThree
  .append("text")
  .attr(
    "transform",
    `translate(${-110}, ${(graph_3_height - margin.top - margin.bottom) / 2})`
  )
  .style("text-anchor", "middle")
  .style("font-size", 10)
  .text("Global Sales (MM)");

const title = svgGraphThree
  .append("text")
  .attr(
    "transform",
    `translate(${(graph_3_width - margin.left - margin.right) / 2}, ${-20})`
  )
  .style("text-anchor", "middle")
  .style("font-size", 15);

let tooltip = d3
  .select("#graph3")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

const publisher = (genre) => {
  d3.csv("data/video_games.csv").then((data) => {
    data = cleanDataGraph3(data, genre);

    x.domain(data.map((d) => d.Publisher));

    y.domain([0, d3.max(data, (d) => d.Global_Sales)]);

    y_axis_label.call(d3.axisLeft(y).tickSize(10).tickPadding(10));
    x_axis_label.call(d3.axisBottom(x).tickSize(0).tickPadding(10));

    const bars = svgGraphThree.selectAll("rect").data(data);

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.Publisher))
      .range(d3.schemeSpectral[10]);

    const mouseenter = (d) => {
      const html = `${d.Publisher}<br/>
                ${d.Global_Sales}`;

      tooltip
        .html(html)
        .style("left", `${d3.event.pageX + 50}px`)
        .style("top", `${d3.event.pageY - 50}px`)
        .style("box-shadow", `2px 2px 5px ${color(d.Publisher)}`)
        .style("opacity", 0.8);
    };

    const mouseleave = () => {
      tooltip.style("opacity", 0);
    };

    bars
      .enter()
      .append("rect")
      .merge(bars)
      .attr("x", (d) => x(d.Publisher))
      .attr("width", x.bandwidth())
      .attr("y", (d) => y(d.Global_Sales))
      .attr("height", (d) => graph_3_height - y(d.Global_Sales))
      .attr("fill", (d) => color(d.Publisher))
      .on("mouseenter", mouseenter)
      .on("mouseleave", mouseleave);

    title.text("Top " + genre + " Publishers").style("font-size", "24px");

    bars.data(data).exit().remove();
  });
};

function cleanDataGraph3(data, genre) {
  const publishers = {};

  Object.values(data).forEach((game) => {
    if (game.Genre === genre) {
      game.Publisher in publishers
        ? (publishers[game.Publisher].Global_Sales =
            publishers[game.Publisher].Global_Sales +
            parseFloat(game.Global_Sales))
        : (publishers[game.Publisher] = {
            Publisher: game.Publisher,
            Global_Sales: parseFloat(game.Global_Sales),
          });
    }
  });

  let returnValue = [];
  for (const elem of Object.values(publishers)) {
    returnValue.push(elem);
  }
  returnValue = returnValue.sort(function (a, b) {
    return b.Global_Sales - a.Global_Sales;
  });
  return returnValue.slice(0, 5);
}

// On page load, render the barplot with the artist data
publisher("Strategy");
