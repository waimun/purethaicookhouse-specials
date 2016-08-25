var http = require('http');
var cheerio = require('cheerio');
var helper = require('sendgrid').mail;
var schedule = require('node-schedule');

// Utility function that downloads a URL and invokes
// callback with the data.
function download(callback) {
  http.get({
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
  var from_email = new helper.Email('putsmail@putsmail.litmus.com');
  var to_email = new helper.Email(toAddress);
  var subject = 'Pure Thai Cookhouse Specials!';
  var content = new helper.Content('text/html', text);
  mail = new helper.Mail(from_email, subject, to_email, content);

  var sg = require('sendgrid')(process.env.SENDGRID_API_KEY);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON()
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
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

        //email('test@example.com', element.html());

        console.log('done');
      } else {
        console.log('error');
      }

    });
  });
}

run();
