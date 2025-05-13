/*jshint node: true*/
'use strict';

var ari = require('ari-client');
var util = require('util');

ari.connect('http://localhost:8088', 'asterisk', 'asterisk', clientLoaded);

// handler for client being loaded
function clientLoaded (err, client) {
  if (err) {
    console.log('Error 1' );
    throw err;
  }

  // handler for StasisStart event
  function stasisStart(event, channel) {
    console.log(util.format(
          'Monkeys! Attack %s!', channel.name));

    var playback = client.Playback();
    channel.play({media: 'sound:tt-monkeys'},
                  playback, function(err, newPlayback) {
      if (err) {
        console.log('Error 2' );
        throw err;
        
      }
    });
    playback.on('PlaybackFinished', playbackFinished);

    function playbackFinished(event, completedPlayback) {
      console.log(util.format(
          'Monkeys successfully vanquished %s; hanging them up',
          channel.name));
// Modificacion del codigo  para evitar que se termina la ejecucion
// Modify in hagnup function to aboid  end of the app for  error
      channel.hangup(function(err) {
        if (err) {
          console.error('Error colgando el canal:', err.message);
          // Aquí decides qué hacer: registrar, notificar, pero NO terminar la app
          return;
        }
        console.log('Canal colgado correctamente');
      });
    }
  }
  // handler for StasisEnd event
  function stasisEnd(event, channel) {
    console.log(util.format(
          'Channel %s just left our application', channel.name));
  }

  client.on('StasisStart', stasisStart);
  client.on('StasisEnd', stasisEnd);

  client.start('channel-playback-monkeys');
}
