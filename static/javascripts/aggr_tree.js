class Tree{
    constructor(){
        this.margin = {top: 20, right: 120, bottom: 20, left: 120};
        this.width = 1500 - this.margin.right - this.margin.left;
        this.height = 1400 - this.margin.top - this.margin.bottom;

        this.svg = d3.select("#nodeLink").select("#canvas")
        .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate("+ 0 + "," + this.margin.top *2  + ")");
        // .attr("transform", "translate("+ this.margin.left + "," + this.margin.top + ")");
        // this.oldaccuracy = -1;
    }

    create(response){
        // console.log('tree create function:');
        let response_data = JSON.parse( response );

        let that = this;
        // tree data
        let treeData = response_data[0];
        // tree data
        let varData = response_data[1];
        let accuracy=[];
        let varImpData = [];
        for(let item in varData){
            // this condition is required to prevent moving forward to prototype chain
            if(varData.hasOwnProperty(item)){
                if(item === 'cv_accuracy'){
                    accuracy= 'accuracy(3-fold-cv): '+ varData[item].toFixed(10);
                     document.getElementById("accuracy").innerHTML = accuracy;
                     // if(this.oldaccuracy !== -1){
                     //     document.getElementById("change").innerHTML =
                     //         'change: ' + (varData[item] - this.oldaccuracy);
                     // }
                     // this.oldaccuracy = varData[item].toFixed(10);
                }
                else{
                    varImpData.push(item+': '+varData[item].toFixed(6));
                }
            }
        }

        // accuracy data
        let varImpList = d3.select("#varImp").selectAll("li").data(varImpData);


        //enter selection
        let varImpEnter = varImpList.enter()
            .append("li")
            .text(function(d){
                return d;
            });
        //exit selection
        varImpList.exit()
            .remove();
        //merge
        varImpList = varImpEnter.merge(varImpList);
        //update
        varImpList
            .text(function(d){
                return d;
            });




        //Initialize tooltip

        let labelTip = d3.tip().attr("class", "d3-tip-node").html((d) => {
            // console.log(d);
            return d[0] + ' has appeared at this position in ' + d[1] + ' trees';
        });

        let ruleTip = d3.tip().attr("class", ".d3-tip").html((d) => {
            // console.log(d.data.rule[1]);
            return d.data.rule[1];
        });

        // console.log(Object.keys(window.rangeValues));

        let d3_schemeCategory20 = [
                                  "#1f77b4", "#aec7e8",
                                  "#ff7f0e", "#ffbb78",
                                  "#2ca02c", "#98df8a",
                                  "#d62728", "#ff9896",
                                  "#9467bd", "#c5b0d5",
                                  "#8c564b", "#c49c94",
                                  "#e377c2", "#f7b6d2",
                                  "#7f7f7f", "#c7c7c7",
                                  "#bcbd22", "#dbdb8d",
                                  "#17becf", "#9edae5"
                                ];
        let features = Object.keys(window.rangeValues);

        features.push("leaf");

        let colorScale = d3.scaleOrdinal()
              // .range([ "rgb(153, 107, 195)", "rgb(56, 106, 197)", "rgb(93, 199, 76)", "rgb(223, 199, 31)", "rgb(234, 118, 47)"])
          .range(d3_schemeCategory20)
          .domain(features);

        let legendsvg = d3.select("svg")
            .attr("height",25 * features.length);

        legendsvg.append("g")
          .attr("class", "legendOrdinal")
          .attr("transform", "translate(20,10)");

        let legendOrdinal = d3.legendColor()
          .shape("path", d3.symbol().type(d3.symbolSquare).size(150)())
          .shapePadding(10)
          .scale(colorScale);

        legendsvg.select(".legendOrdinal")
          .call(legendOrdinal);

        // let colorScale = d3.scaleOrdinal(d3.schemeCategory20).domain(d3.range(0,19));
        // let colorMap = {};
        // for(i = 0; i < window.labels.length; ++i){
        //      colorMap[window.labels[i]] = i;
        // }
        // console.log(colorMap);
        this.svg.selectAll('g').remove();

        that.svg.append('g')
        .attr("transform", "translate("+ 0 + "," + this.margin.top *2  + ")");

        // leafHorizontalScale
        let leafWidth = 70;
        let maxLeafCount = 0;
        maxLeafCount = Object.values(window.labelCount)
            .reduce((a, b) => window.labelCount[a] > window.labelCount[b] ? a : b);

        // set inner node rectangles height and width
        let inner_rect_height = 14;
        let inner_rect_width = 18;

        // console.log(root);
        let i = 0,
        duration = 750,
        root;


        // declares a tree layout and assigns the size
        let treemap = d3.tree().size([this.height, this.width])
                .separation(function(a, b) { return (a.parent === b.parent ? 2 : 2); });
        
        // Assigns parent, children, height, depth
        root = d3.hierarchy(treeData, function(d) { return d.children; });
        root.x0 = this.height / 2;
        root.y0 = 0;

        // console.log(root.leaves());
        // root.leaves().forEach(function (leaf) {
        //
        // });

        // Collapse after the second level
        // root.children.forEach(collapse);

        update(root);

        // Collapse the node and all it's children
        function collapse(d) {
            if(d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null
            }
        }

        function update(source) {

            // Assigns the x and y position for the nodes
            let treeData = treemap(root);
          
            // Compute the new tree layout.
            let nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);
          
            // Normalize for fixed-depth.
            nodes.forEach(function(d){
                d.y = d.depth * 75;
            });

            // ****************** Nodes section ***************************//
          
            // Update the nodes...
            let node = that.svg.selectAll('g.node')
                .data(nodes, function(d) {
                    // console.log(d);
                    // console.log(d.hasOwnProperty('children'));
                    return d.id || (d.id = ++i);
                });
          
            // Enter any new modes at the parent's previous position.
            let nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("transform", function(d) {
                        // console.log(d);
                  return "translate(" + source.x0 + "," + source.y0 + ")";
              })
              .on('click', function (d) {
                    // console.log(d.data.isLeaf);
                  if(!d.data.isLeaf){
                      return click(d);
                  }
              });

             // UPDATE
            let nodeUpdate = nodeEnter.merge(node);


            nodeUpdate.each(function (d) {
                // console.log("hello");
               if(!d.hasOwnProperty('children')){
                   drawLeafNode(d3.select(this), d);
               }
               else {
                   drawSplitNode(d3.select(this), d);
               }
            });


            function drawSplitNode(element, d){

                element.selectAll('rect').remove();
                element.selectAll('text').remove();

/*
                element.append('rect')
                    .attr('class', 'node')
                    .attr('width', splitNodeWidth)
                    .attr("height", 20)
                    .style("fill", function(d) {
                        console.log(d);
                        return d._children ? "lightsteelblue" : "#fff";
                    });
*/
                let keys_length = Object.keys(d.data.name).length;

                let frects = element.selectAll('innernode')
                    .data(function(d){
                        // return [i, keys[i], frequency, keys.length];
                         return Object.entries(d.data.name)
                    });

                let frectsEnter = frects.enter().append('g')
                                .attr('class', 'innernode');

                frects = frectsEnter.merge(frects);

                frects.exit().remove();

                frects.append('rect')
                    .attr("width", inner_rect_width)
                    .attr("height", inner_rect_height)
                    // TODO: create a color scale for all features
                    .style("fill", function (d) {
                        return colorScale([d[0]]);
                    })
                    .call(labelTip)
                        .on("mouseover", labelTip.show)
                        .on("mouseout", labelTip.hide);

                    // .style("fill", function(d) {
                    //     console.log(d);
                    //     return d._children ? "diagonal-stripe-1" : "#fff";
                    // });

                // Add  count for the nodes
                frects.append('text')
                    // .attr("dx", "2em")
                    // .attr("dy", "2em")
                    .attr("text-anchor", "middle")
                    .text(function(d) {  return d[1]; })
                    .attr('transform','translate(7, 11)');

                frects.attr("transform", function(d,i) {
                        // console.log(d);
                        if (i > (keys_length/2)){
                            return "translate(" +
                                (inner_rect_width*((i-keys_length/2) - (keys_length/3.5))) + "," +
                                inner_rect_height + ")";
                        }
                        return "translate(" + inner_rect_width*(i - (keys_length/3.5)) + ")";
                    });



                // Transition to the proper position for the node
                element.transition()
                  .duration(duration)
                  .attr("transform", function(d) {
                      return "translate(" + d.x + "," + d.y + ")";
                   });

            }


            function drawLeafNode(element, d){

                element.selectAll('rect').remove();
                element.selectAll('text').remove();

                let frects = element.selectAll('innernode')
                    .data(function(d){
                        // return [i, keys[i], frequency, keys.length];
                         return Object.entries(d.data.name)
                    });

                let frectsEnter = frects.enter().append('g')
                                .attr('class', 'innernode');

                frects = frectsEnter.merge(frects);

                frects.exit().remove();

                frects.append('rect')
                    .attr("width", inner_rect_width)
                    .attr("height", inner_rect_height)
                    // TODO: create a color scale for all features
                    .style("fill", function (d) {
                        return colorScale([d[0]]);
                    })
                    .attr("x", -8);
                     // .attr("transform", "translate(-2em,0)");
                    // .style("fill", function(d) {
                    //     console.log(d);
                    //     return d._children ? "diagonal-stripe-1" : "#fff";
                    // });

                // Add  count for the nodes
                frects.append('text')
                    // .attr("dx", "2em")
                    // .attr("dy", "2em")
                    .attr("text-anchor", "middle")
                    .text(function(d) {  return d[1]; })
                    .attr('transform','translate(-1, 11)');


                // Transition to the proper position for the node
                element.transition()
                  .duration(duration)
                  .attr("transform", function(d) {
                      return "translate(" + d.x + "," + d.y + ")";
                   });

            }



            // Remove any exiting nodes
            let nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function(d) {
                    return "translate(" + source.x + "," + source.y + ")";
                })
                .remove();
          
            // On exit reduce the node circles size to 0
            // nodeExit.select('circle')
            //   .attr('r', 1e-6);
          
            // On exit reduce the opacity of text labels
            nodeExit.select('text')
              .style('fill-opacity', 1e-6);
          
            // ****************** links section ***************************
          
            // Update the links...
            let link = that.svg.selectAll('path.link')
                .data(links, function(d) { return d.id; });
          
            // Enter any new links at the parent's previous position.
            let linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function(d){
                  let o = {y: source.y0, x: source.x0};
                  return diagonal(o, o)
                });
          
            // UPDATE
            let linkUpdate = linkEnter.merge(link);
          
            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d){ return diagonal(d, d.parent) });
          
            // Remove any exiting links
            let linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                    let o = {y: source.y0, x: source.x0};
                //   let o = {x: source.x, y: source.y}
                  return diagonal(o, o)
                })
                .remove();
          
            // Store the old positions for transition.
            nodes.forEach(function(d){
              d.x0 = d.x;
              d.y0 = d.y;
            });
          
            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {
          
              let path = `M ${s.x} ${s.y}
                      C ${s.x} ${(s.y + d.y) / 2},
                        ${d.x} ${(s.y + d.y) / 2},
                        ${d.x} ${d.y}`;
          
              return path
            }
          
            // Toggle children on click.
            function click(d) {
              if (d.children) {
                  d._children = d.children;
                  d.children = null;
                } else {
                  d.children = d._children;
                  d._children = null;
                }
              update(d);
            }
          }
    
    }
}