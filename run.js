var https = require('https');
var cheerio = require('cheerio');
var schedule = require('node-schedule');

// Utility function that downloads a URL and invokes
// callback with the data.
function download(callback) {
  https.get({
    hostname: 'www.purethaicookhouse.com',
    path: '/specials',
    headers: {'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36'}
  }, function(res) {
    var data = '';
    res.on('data', function (chunk) {
      data += chunk;
    });
    res.on('end', function() {
      callback(data);
    });
  }).on('error', function() {
    callback(null);
  });
}

function email(toAddress, text) {
  const sgMail = require('@sendgrid/mail');
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const msg = {
    to: toAddress,
    from: 'Pure Thai Cookhouse <info@purethaicookhouse.com>',
    subject: 'Pure Thai Cookhouse Specials!',
    html: text
  };
  sgMail.send(msg)
  .then(() => {
    console.log('success: sent email.');
  })
  .catch(error => {
    const { message, code, response } = error;
    console.log(message);
  });
}

function run() {
  var j = schedule.scheduleJob('30 11 * * *', function(){

    download(function(data) {
      if (data) {
        //console.log(data);

        var $ = cheerio.load(data);
        var element = $('#block-yui_3_17_2_3_1450922825547_3976');
        //console.log(element.html());

        if (element.length == 0) {
          console.log('error: cannot find element.');
          return;
        }

        var to_address = process.env.TO_ADDRESS;
        if (to_address === undefined) {
          console.log('error: env variable TO_ADDRESS not found.');
          return;
        }

        email(to_address, element.html());
      } else {
        console.log('error: cannot download page.');
      }

    });
  });
}

run();
