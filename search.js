const express = require('express');
const axios = require('axios');
const logger = require('morgan');
const router = express.Router();
router.use(logger('tiny'));

const key = "XXXXXXX";

// This contains name and appID for all games on steam.
// I have a local copy as making a request for it each time would take around 4 seconds.
const json = require("..\\steamID.json");

router.get('/', (req, res) => {

    // Initiliase variables.
    // Exists is set to false if we can't find the game on steam, or through the ITAD API
    exists = true;
    steam_exists = true;
    title = req.query.game;

    // Check if the game exists in the steam data
    try{
        appID = getAppID(json.applist.apps, title);
    }
    catch{
        steam_exists = false;
    }
    // If it does exist, make the requests to get all the information.
    if(steam_exists){    

        appID2 = "app/" + appID;
        
        // Get deals from the isthereanydeal API
        axios.get(`https://api.isthereanydeal.com/v01/game/overview/?key=${key}&shop=steam&ids=app/${appID}`)
        .then( (response) =>{

            if(response.data.data[appID2].price === null){
                exists = false;
            }
    
            current = response.data.data[appID2].price;
            cheapest = response.data.data[appID2].lowest;
            
            // Get reviews from the steam API
            return axios.get(`https://store.steampowered.com/appreviews/${appID}?json=1`)
        })
        .then( (response) => {
            score = response.data.query_summary.review_score_desc;
            reviews = response.data.reviews;
        })
        .then( () =>{
            // Render template with all variables.
            res.render('search', { title, appID, score, reviews,cheapest, current,});
            res.end();
        })
        .catch((error) => {
            console.error(error);
        })
    }
    // Otherwise, render the 'can't be found' page.
    else{
        res.render('search_not_found', { title});
        res.end();
    }
}); 

// Function to get the App ID from a given game title.
function getAppID(apps, title){
    app = apps.find(app => app.name.toLowerCase() === title.toLowerCase());
    return app.appid
}

module.exports = router;

