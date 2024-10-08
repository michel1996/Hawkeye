class BallCoordinates{
    
    static fetchCoords(points)
    {
        let coords = [];
        for(var i=0; i < points.length; i++)
        {
            coords.push(parseFloat(points[i].x),parseFloat(points[i].y),0);
        }
        return coords;
    }
    
    static fetchTimeValues(points)
    {
        let timeValues = [];
        for(var i=0; i < points.length; i++)
        {
            timeValues.push(parseFloat(points[i].time));
        }
        return timeValues;
    }
}

export { BallCoordinates };