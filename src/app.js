'use strict';

const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.set('views', './src');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

module.exports = (db) => {
    //For getting the health of the response if returned status 200
    app.get('/health', async (req, res) => {
       await res.send('Healthy');
    });

    //For viewing Documentation
    app.get('/viewDocumentation', async (req, res) => {
       await res.render('docuView');
    });

    //For inserting/inputting rides into database using JSON as a request body then upon sucessful the inputted values will be displayed as JSON response
    //EX.) localhost:8010/inputRides
    // {
    //     "start_lat":50,
    //     "start_long":100,
    //     "end_lat":50,
    //     "end_long":100,
    //     "rider_name":"rhenz",
    //     "driver_name":"nonPro",
    //     "driver_vehicle":"toyota"
    // }
    app.post('/inputRides', jsonParser, (req, res) => {
        const startLatitude = Number(req.body.start_lat);
        const startLongitude = Number(req.body.start_long);
        const endLatitude = Number(req.body.end_lat);
        const endLongitude = Number(req.body.end_long);
        const riderName = req.body.rider_name;
        const driverName = req.body.driver_name;
        const driverVehicle = req.body.driver_vehicle;

        if (startLatitude < -90 || startLatitude > 90 || startLongitude < -180 || startLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Start latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (endLatitude < -90 || endLatitude > 90 || endLongitude < -180 || endLongitude > 180) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'End latitude and longitude must be between -90 - 90 and -180 to 180 degrees respectively'
            });
        }

        if (typeof riderName !== 'string' || riderName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverName !== 'string' || driverName.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        if (typeof driverVehicle !== 'string' || driverVehicle.length < 1) {
            return res.send({
                error_code: 'VALIDATION_ERROR',
                message: 'Rider name must be a non empty string'
            });
        }

        var values = [
            startLatitude, 
            startLongitude, 
            endLatitude, 
            endLongitude, 
            riderName, 
            driverName, 
            driverVehicle
        ];
        
        const result = db.run('INSERT INTO Rides(startLat, startLong, endLat, endLong, riderName, driverName, driverVehicle) VALUES (?, ?, ?, ?, ?, ?, ?)', values, async function (err) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            await db.all('SELECT * FROM Rides WHERE rideID = ?', this.lastID, function (err, rows) {
                if (err) {
                    return res.send({
                        error_code: 'SERVER_ERROR',
                        message: 'Unknown error'
                    });
                }

                res.send(rows);
            });
        });
    });

    //For getting all the rides
    //EX.) localhost:8010/getRides
    app.get('/getRides', async (req, res) => {
        await db.all('SELECT * FROM Rides', function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    //For getting the specific ride based from the rideID from the schema
    //EX.) localhost:8010/selectRides/1
    app.get('/selectRides/:id', async (req, res) => {
        await db.all(`SELECT * FROM Rides WHERE rideID='${req.params.id}'`, function (err, rows) {
            if (err) {
                return res.send({
                    error_code: 'SERVER_ERROR',
                    message: 'Unknown error'
                });
            }

            if (rows.length === 0) {
                return res.send({
                    error_code: 'RIDES_NOT_FOUND_ERROR',
                    message: 'Could not find any rides'
                });
            }

            res.send(rows);
        });
    });

    return app;
};
