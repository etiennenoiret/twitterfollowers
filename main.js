var https = require('https');

var OAuth= require('oauth').OAuth;
var keys = require('./twitterkeys');
var myself = "0123456"; // Your twitter id
var twitterer = new OAuth(
		   "https://api.twitter.com/oauth/request_token",
		   "https://api.twitter.com/oauth/access_token",
		   keys.consumerKey,
		   keys.consumerSecret,
		   "1.0A",
		   null,
		   "HMAC-SHA1"
		  );

// url, oauth_token, oauth_token_secret, callback

twitterer.get("https://api.twitter.com/1.1/friends/ids.json?user_id="+myself+"&cursor=-1&count=5000",
	       keys.token, keys.secret,
  function (error, data, response) {
    if(error) {
      console.log('Error: Something is wrong.\n'+JSON.stringify(error)+'\n');
    } else {
      var ids = JSON.parse(data).ids; // array of ids
      var delay = 10*1000; // 10 seconds
      for(i in ids) {
        delayCheckFriendship(myself, ids[i], delay*i); // 1 call every 10 seconds to avoid twitter API rate limit...
      }
    }
});

function delayCheckFriendship(source, target, delay) {
  setTimeout(
    function() {
      checkFriendship(myself, target)
    }, delay);
}

function checkFriendship(source, target) {
  twitterer.get("https://api.twitter.com/1.1/friendships/show.json?source_id="+source+"&target_id="+target,
  	       keys.token, keys.secret,
    function (error, data, response) {
      if(error) {
        if(error.statusCode==429) { //Rate limit exceeded
          console.error("Exiting, rate limit exceeded");
          process.exit(1); // don't make more requests
        } else {
          console.log('Error: Something is wrong.\n'+JSON.stringify(error)+'\n');
        }
      } else {
        var res = JSON.parse(data);
        //console.log(res);
        if(res.relationship.source.following && !res.relationship.source.followed_by) {
          console.log(res.relationship.target.screen_name +" doesn't follow you back!")
        } else {
          console.log("Nothing to say regarding %s", res.relationship.target.screen_name);
        }
      }
  });
}
