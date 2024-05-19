async function fetchData() {
    const response = await fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    const data = await response.json()
    return data
     
}

function processData(data){
    return data.features.map(features => ({
        coordinates : features.geometry.coordinates,
        magnitude : features.properties.mag,
        time : new Date(features.properties.time)
    }))
}

function plotData(earthquake){
    plotMap(earthquake)
    plotMagnitudeHistogram(earthquake)
    plotTimesSeries(earthquake)
    plotMagnitudeVsDepth(earthquake)

}

function plotMap(earthquake){
    console.log(earthquake)
    const trace1 = {
        type : 'scattergeo',
        locationmode : 'world',
        
        lon : earthquake.map(d => d.coordinates[0]),
        lat : earthquake.map(d => d.coordinates[1]),
        text : earthquake.map(d => `Magnitude: ${d.magnitude} Time: ${d.time}`),
        marker :{
            size : earthquake.map(d => d.magnitude * 4) ,
            color : earthquake.map(d => d.magnitude),
            cmin : 0,
            cmax : 8,
            colorscale: [[0, 'rgb(255,204,103)'], [0.40, 'rgb(255,122,212)'], [0.6, 'rgb(204,123,255)'], [0.80, 'rgb(123,204,255)'], [1, 'rgb(82,204,255)']],
            reversescale: false, 
            showscale: true,
            colorbar: {
                title: 'Magnitude'
            }         
        }
    }
    const layout1 = {
        animation_frame : 'month',
        title : "Global Eartquake in the Last Week",
        geo : {
            scope : 'world',
            projection : {
                type : 'natural earth'
            },
            showland : true,
            landcolor : 'rgb(243,243,243)',
            countrycolor : 'rgb(204, 204, 204)'
        },
        height : 500,
    }
    Plotly.newPlot('earthquakePlot', [trace1], layout1)
    
}

function plotMagnitudeHistogram(earthquake){
    const magnitudes = earthquake.map(d => d.magnitude)
    const trace = {
        x : magnitudes,
        type : 'histogram',
        marker : {
            color : 'rgb(255,122,212)'
        }
    }
    const layout = {
        title : "Histogram of Earthquake Magnitudes",
        xaxis : {title : 'Magnitude'}, 
        yaxis : {title : 'Frequency'}
    }
    Plotly.newPlot('magnitudeHistogram', [trace], layout)
}

function plotTimesSeries(earthquake){
    const dates = earthquake.map(d => d.time.toISOString().slice(0,10))
    const dateCounts = dates.reduce((acc, date) => {
        acc[date] = (acc[date] || 0) +1
        return acc
    }, {})
    const trace = {
        x : Object.keys(dateCounts),
        y : Object.values(dateCounts),
        type : 'scatter',
        mode : 'lines-makers',
        marker : {color : 'rgb(204,123,255)' }
    }
    const layout = {
        title : 'Daily Earthqueke Frequency',
        xaxis : {title : 'Date'}, 
        yaxis : {title : 'Number of Earthquake'}, 
    }
    Plotly.newPlot('timeSeriesPlot', [trace], layout)
}

function plotMagnitudeVsDepth(earthquake){
    const magnitudes = earthquake.map(d => d.magnitude)
    const depths = earthquake.map(d => d.coordinates[2])
    const trace = {
        x : magnitudes,
        y : depths,
        mode : 'markers',
        type : 'scatter',
        marker : {size : 8, color : 'rgb(123,204,255)'},
    }
    const layout = {
        title : 'Magnitude vs Depth',
        xaxis : {title : 'Magnitude'},
        yaxis : {title : 'Depth (km)'},
        height : 600,
        width : 600
    }
    Plotly.newPlot('magnitudeDepth', [trace], layout)
}

fetchData()
    .then(data => processData(data))
    .then(data => plotData(data))