class Tree{
    constructor(){
        this.margin = {top: 20, right: 120, bottom: 20, left: 120};
        this.width = 960 - this.margin.right - this.margin.left;
        this.height = 960 - this.margin.top - this.margin.bottom;

        this.svg = d3.select("#nodeLink").select("#canvas")
        .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top + this.margin.bottom)
        .append("g")
        .attr("transform", "translate("+ 0 + "," + this.margin.top *2  + ")");
        // .attr("transform", "translate("+ this.margin.left + "," + this.margin.top + ")");
    }

    create(response_data){
        // console.log('tree create function:');
        var that = this;
        //Initialize tooltip
        let labelTip = d3.tip().attr("class", ".d3-tip").html((d) => {
            // console.log(d);
            return '<span>' + d[1] + '</span>' + ' sample(s) of ' + d[0]
        });

        let colorScale = d3.scaleOrdinal(d3.schemeCategory10).domain(d3.range(0,9));
        let colorMap = {};
        for(i = 0; i < window.labels.length; ++i){
             colorMap[window.labels[i]] = i;
        }
        // console.log(colorMap);
        this.svg.selectAll('g').remove();

        that.svg.append('g')
        .attr("transform", "translate("+ 0 + "," + this.margin.top *2  + ")");

        // leafHorizontalScale
        let leafWidth = 70;
        let maxLeafCount = 0;
        maxLeafCount = Object.values(window.labelCount)
            .reduce((a, b) => window.labelCount[a] > window.labelCount[b] ? a : b);

        let leafHorizontalScale = d3.scaleLinear()
          .range([0, leafWidth])
          .domain([0, maxLeafCount]);
         let splitNodeWidth = 50;

        var treeData = JSON.parse( response_data );
        // console.log(root);
        var i = 0,
        duration = 750,
        root;


        // declares a tree layout and assigns the size
        let treemap = d3.tree().size([this.height, this.width]);
        
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
            var treeData = treemap(root);
          
            // Compute the new tree layout.
            var nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);
          
            // Normalize for fixed-depth.
            nodes.forEach(function(d){ d.y = d.depth * 100});
          
            // ****************** Nodes section ***************************//
          
            // Update the nodes...
            var node = that.svg.selectAll('g.node')
                .data(nodes, function(d) {
                    // console.log(d);
                    // console.log(d.hasOwnProperty('children'));
                    return d.id || (d.id = ++i);
                });
          
            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("transform", function(d) {
                  return "translate(" + source.x0 + "," + source.y0 + ")";
              })
              .on('click', click);

             // UPDATE
            var nodeUpdate = nodeEnter.merge(node);


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

                element.append('rect')
                    .attr('class', 'node')
                    .attr('width', splitNodeWidth)
                    .attr("height", 20)
                    .style("fill", function(d) {
                        return d._children ? "lightsteelblue" : "#fff";
                    });

                // Add labels for the nodes
                element.append('text')
                    .attr("dy", ".35em")
                    .attr("y", function(d) {
                        return d.children || d._children ? -13 : 13;
                    })
                    .attr("text-anchor", "middle")
                    .text(function(d) {  return d.data.name; })
                    .attr("transform", function(d) {
                       // console.log(d);
                       return "translate(" + ((splitNodeWidth/3.5)) + "," + 0 + ")";
                    });

                // Transition to the proper position for the node
                element.transition()
                  .duration(duration)
                  .attr("transform", function(d) {
                      // console.log(d);
                      return "translate(" + (d.x - (splitNodeWidth/2))+ "," + d.y + ")";
                   });
                    // comment block -1
                    // console.log(d.data.name);
                    // console.log(window.rangeValues);
                    // console.log(window.rangeValues[d.data.name]);
                    //scale for defining length according to the attribute
                    // let nScale = d3.scaleLinear()
                    //     // .domain([window.rangeValues])
                    //     .range([0, 50])
                    //     .domain([window.rangeValues[d.data.name].min,
                    //     window.rangeValues[d.data.name].max]);
                    // let len = Math.abs(window.rangeValues[d.data.name].min -
                    //     window.rangeValues[d.data.name].max);
                    // return nScale(len);
            }


            function drawLeafNode(element, d){
                var boundbox = element.selectAll('.bbox')
                    .data([{'key':'bbox','value':'bbox'}]);

                //TODO: move css to style.css and transform to move box to left
                boundbox.enter().append('rect')
                    .attr('width', 75)
                    .attr('height', 55)
                    .attr('style', 'stroke: darkgray; stroke-width: 2px')
                    .attr('fill', 'none')
                    .attr('class','bbox');
                    // .attr('transform','translate(0, )');

                boundbox.exit().remove();

                // element.selectAll('circle').remove();
                element.selectAll('text').remove();

               // Set up the scale - different for each leaf node
                // sets position of each rect in leaf node
                // console.log(d);
                var positionScale = d3.scaleLinear()
                    .domain([0, d.data.leafCounts.length])
                    .range([0, 50]);

                var rects = element.selectAll('labelbar')
                    .data(d.data.leafCounts);

                var rectsEnter = rects.enter().append('rect');

                // console.log(d);
                rectsEnter
                    .attr('id', function (d) {
                        return d[0];
                    })
                    .attr("y", function(d, i){return (positionScale(i)+3);})
                    .attr("x", 0)
                    .attr("width", function(d, i) {
                        return leafHorizontalScale(d[1]);
                    })
                    // .attr("height",50/counts.length)
                    .attr("height",7)
                    // TODO: create a color scale for all labels
                    .style("fill", function (d) {
                        return colorScale(colorMap[d[0]]);
                    })
                    .attr("class","labelbar");

                rects.exit().remove();

                rects = rectsEnter.merge(rects);

                rects.filter(function(d) { return d.value === "0"; }).remove();

                rects.call(labelTip)
                    .on("mouseover", labelTip.show)
                    .on("mouseout", labelTip.hide);

                // Transition to the proper position for the node
                element.transition()
                  .duration(duration)
                  .attr("transform", function(d) {
                      // console.log(d);
                      return "translate(" + (d.x - (leafWidth/3.5)) + "," + d.y + ")";
                   });
            }



            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
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
            var link = that.svg.selectAll('path.link')
                .data(links, function(d) { return d.id; });
          
            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function(d){
                  var o = {y: source.y0, x: source.x0};
                  return diagonal(o, o)
                });
          
            // UPDATE
            var linkUpdate = linkEnter.merge(link);
          
            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function(d){ return diagonal(d, d.parent) });
          
            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function(d) {
                    var o = {y: source.y0, x: source.x0};
                //   var o = {x: source.x, y: source.y}
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
          
              var path = `M ${s.x} ${s.y}
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