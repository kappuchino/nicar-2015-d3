// Our JavaScript 
function drawChart(dataset) {

  // Select our tooltip
  var tooltip = d3.select('#tooltip');

  // TODO: Define dimensions
  // Define a couple variables we will use to set the dimensions of our chart
  // Margins is an object that contains four attributes that we'll use to calculate
  // the svg element and inner element's height and width
  var margin = {top: 20, right: 25, bottom: 30, left: 50},
      width = 1024 - margin.right - margin.left,
      height = 600 - margin.bottom - margin.top;

  // TODO: Define scales
  // Use d3's min and max function to find the extent of our data we plan to display on each axis
  // We need to tell d3 what data to find the min and max of so we first specify our data set
  // Since our data is an array of objects (not one dimensional) we pass an anonymous function 
  // and a placeholder "d" to represent our current data as an arugement for the method to loop over
  // and specify the what value we want to be compared
  var xMin = d3.min(dataset, function(d) { return d['volume']; }), // Accessing the attribute, volume, via bracket notation
      xMax = d3.max(dataset, function(d) { return d['volume']; }),
      yMin = d3.min(dataset, function(d) { return d['strength']; }),
      yMax = d3.max(dataset, function(d) { return d['strength']; });

  // Create a variable to store a function we will use to translate our x data to the x axis of our chart
  // We first need to create a linear scale and configure for our data
  var xScale = d3.scale.linear()
  // The input domain represents the range of possible input values, or the min and max of that data 
  // on the x axis in our case, but we can define the values however we like In most cases the domain 
  // method takes an array of two values
      .domain([xMin, xMax])
  // The output range represents the range of possible output values, or more simply the size of our 
  // visualization as it renders on the page in pixels. In this case we want to start at 0 and end at
  // the width of chart as defined earlier
      .range([0, width]);
                    
  var yScale = d3.scale.linear()
      .domain([yMin, yMax])
      .range([height, 0]); // We need to flip the order of the values for the y or the data will be upside down

  // TODO: Create axes
  // Create a function to display the visual elements of our axis
  // We'll start with D3's basic axis function
  var xAxis = d3.svg.axis()
  // Remember when I said the xScale is a function, well it's also an object with information
  // that tells our axis how tall or wide it should draw and also how to label it
      .scale(xScale) // Tell our axis which scale we want
      .ticks(10); // How many labels do we want on our axis?

  var yAxis = d3.svg.axis()
      .scale(yScale)
      .tickSize(-width) // Draw our y axis lines all the way across our chart. The size needs to be negative since we flipped our chart to look right side up
      .ticks(7)
      .tickPadding(8) // Add a little spacing between the lines and labels
      .orient('left'); // Align our scale to the left

  // TODO: Create SVG
  // Create a variable for the svg element we are about to create
  // First we'll select the div on our page that we created as a target for our chart
  // Then nest an svg g element inside
  // A note about indentations. You'll frequently see different indentations when chaining methods. 
  // I always follow a pattern that of one indentation for the creation of a new element and two 
  // indentations on each line that modifies the new element
  var svg = d3.select('#chart-container').append('svg')
  // Add an element attribute to define the width of the svg; we want to add in our margins so 
  // the svg is at the maximum width
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom) // Same with the height
    .append('g') // Create a g element where we will group chart content.
    // A g element lets us collect a number of child elements and transform them together, similar 
    // to a div in HTML
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); // Offset the g element to match our margins and reset our coordinate system to the group element

  // TODO: Draw axes
  // Since we are appending new elements to an existing element "drawing" order matters
  // We want our scales to be "behind" our scatterplot points on the screen so we need to call 
  // those drawing functions first
  // Create a g element to group each axis
  svg.append('g')
    .attr('class', 'x axis') // Add some CSS classes for styling selectors
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis); // Call our function to display axis elements

  svg.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  // TODO: Draw dots
  // The variable 'svg' already represents our selected svg element on the page
  svg.selectAll('circle') // Selects all circle elements in our svg, which don't exist yet so it's empty .. confused yet? .. stick with me
      .data(dataset) // Counts and parses our data then binds it to the elements, which don't exist yet. We will create a circle element for every data value (row in our csv)
      .enter() // Here's where the magic happens. D3 puts data for any "missing" elements in the enter selection
    .append('circle') // Then we append a circle element for each value in the enter selection and appened to our svg (parent element)
      .attr('class', function(d) { // Creates an class attribute and using another anonymous function passes our data (d)
        return "dot " + d.type; // Then we return the string, dot, and the type attribute in our data value, which are now assinged as CSS classes
      })
      .attr('cx', function(d) { return xScale(d['volume']); }) // cx defines a circle element's x-axis coordinate
      .attr('cy', function(d) { return yScale(d['strength']); }) // cy defines a circle element's y-axis coordinate
      .attr('r', function(d) { return d['caffeine']/15 }) // r defines the radius of our circle
      .on('mouseover', function(d) { // Add an event listener that will be invoked when the cursor hovers over the element

        var dot = d3.select(this); // Creates a variable for the current moused over element
        dot.classed('active', true); // Adds a css class to our current element

        // Lets pause for a second and talk about this and all its magic. This is a special variable
        // It changes depending on the context. In this case, 'this' references the DOM node that is the target
        // of the event that we're handling, which d3 sets for us

        this.parentNode.appendChild(this); // Re-appends the hovered circle, which sends it to the front of the others and makes it easier to see

        // TODO: tooltips
        // Add out data to the tooltip by "finding" the element with the appropriate class and setting the html contents of the element
        // We use selectAll to find the element we want. Notice we can add more html into our element, such as a span?
        tooltip.selectAll('.beverage').html(d['drink']);
        tooltip.selectAll('.volume').html("Volume: " + '<span>'+ d['volume'] + '</span>');
        tooltip.selectAll('.caffeine').html("Caffeine: " + '<span>'+ d['caffeine'] + '</span>');
        tooltip.selectAll('.strength').html("Strength: " + '<span>'+ d['strength'] + '</span>');

        // Show the tooltip and end the function with return
        return tooltip.style('visibility', 'visible');

      })
      .on('mousemove', function(){ // Add an event listener that will be invoked when the cursor moves on an element
        // Find the width of our tooltip. We'll need this to know if we should flip the tooltip to the other side of the cursor
        // Notice tooltip.style('width') is a string with a 'px' suffix? That will make it difficult to compare it to another number
        // so we'll use javascripts parseInt function to conver our string to a number
        var tipWidth = parseInt(tooltip.style('width'), 10);
        // Set position of the tooltip based on mouse position
        // First determine the x position of the cursor and if there is enough room to the right to fit the tooltip
        // without spilling out of the svg. d3.event stores the current event and .offsetX property contains the X position
        // of cursor relative to the svg container
        if (d3.event.offsetX > ((width - tipWidth))) {
          // If there isn't enough space the flip the tooltip to the left of the cursor
          return tooltip
            // Move the tooltip 40 pixels from the top of the tooltip; .pageY returns the Y position of the cursor
            // .pageY property stores a position relative to the document
            .style('top', (d3.event.pageY - 40) + 'px')
            // Move the tooltip to the left of the cursor by the width of the tooltip plus a little extra
            // so the tooltip isn't centered on the cursor
            .style('left',(d3.event.pageX - (tipWidth + 32)) + 'px');
        } else {
          // If there is enough space place the tooltip to the right of the cursor
          return tooltip
            .style('top', (d3.event.pageY - 40) + 'px')
            .style('left',(d3.event.pageX + 10) + 'px');
        }
      })
      .on('mouseout', function(d) { // Add an event listener that will be invoked when the cursor moves off the element
        var dot = d3.select(this); 
        d3.select(this).classed("active", false); // Removes the css class

        // Hide the tooltip and end the function with return
        return tooltip.style('visibility', 'hidden');
      });

}

// TODO: Load data
// Use D3's built in CSV parser and will invoke either a callback for our parsed rows or an error callback
// A callback is simply a function that is called once another function does something, like success of failure
// The parsed rows will now be in the form of an array of objects
d3.csv('data/caffeine.csv', function(error, data) {
  // If there is an error loading our data execute the log statement
  if(error) {
    console.log('BUSTED!'); 
  } else {
    var test = [];

    // D3's csv request and parser always returns every value as a string. We need to convert a couple of our
    // attributes into numbers to display on the chart
    // We loop over each value in our data array and convert our strings to numbers using the + operator
    data.forEach(function(d) {
      d.volume = +d.volume; // convert our volume attribute into a number
      d.caffeine = +d.caffeine;
      d.strength = +d.strength;

      // Filtering data types looking for something possibly interesting
      // Can edit the csv once we decide on something and ditch all this
      // test array business
      if(d.type === 'soda'|| d.type === 'energydrink' || d.type === 'shots') {
        test.push(d);
      }
    });
    // Call our draw chart function with our data that is ready for visualizing
    drawChart(test);
  }
});

