var url = require('../../../modules/url');
var article_connector = require('../../../modules/connectors/fivepoints/article');
var request = require('request');
var traverse = require('traverse');
var _ = require('lodash-node');
var mediaUrl= require('../../../modules/media-url');

exports.json = function(path, settings, callback) {
  "use strict";
  article_connector.latest(settings.site.id, function(error, feed){
    
    var feed_data = { "newsfeed" : { "stories" : [] } };
    if (error) { 
        console.error(error); 
        callback(feed_data);
    } else {
    _.each(feed[settings.site.id].articles, function(article) {
        console.log("Processing article: " + article.entryTitle);
        try { 
        var item = {};
        item.date = article.publishDate;
        item.title = {};  //article.entryTitle;
        item.title.long = article.longerHeadline;
        item.title.short = article.shorterHeadline;
        item.subtitle = article.excerpt;
        item.excerpt = article.excerpt; // TODO: This should be the before-the-jump text
        item.hasJump = false; // TODO: Not in feed
        //item.readMore = ""; // TODO: Not in feed
        item.author = []; 
        _.each(article.authoredBy, function(author) {
            var new_author = {};
            new_author.name = author; 
            // TODO: slug not in feed
            new_author.slug = 'authorslug';
            item.author.push(new_author);
        });
        item.url = article.canonicalUrl.replace(settings.site.hostRegEx, "");
        // TODO: feature rubric slug data missing in feed
        /*item.rubric = {};
        item.rubric.name = article.featureRubric;*/
        if (article.assetNodePath) {
            item.img = {};
            // TODO: Missing img metadata in feed
            item.img.url  =  mediaUrl.toMediaPlayUrl(item.url, article.assetNodePath); 
            item.img.alt = "Alt Text"; // TODO: Not in feed
            item.img.type = (article.entryLayout === "Medium Image")
                ? "square"
                : article.entryLayout === "Wide Image"
                ? "horizontal"
                : article.entryLayout === "Interstitial"
                ? "thumb"
                : "thumb";
            if (article.entryLayout === "Video") {
                item.video = true;
            }
            // TODO: Infographics not in feed yet
            else if (article.entryLayout === "Slideshow") {
                item.infographic = true;
            }
        }
        feed_data.newsfeed.stories.push(item);

        }catch(err){
            console.error("Index page error: " + err);
        }
    });
    console.log(JSON.stringify(feed_data));
    callback(feed_data);
    }
  });
}
