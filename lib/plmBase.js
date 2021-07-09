'use strict';

const got = require('got').extend({
    handlers: [
      // Hack because the Insteon hub expects capitalized "Authorization" header
      (options, next) => {
        const headers = options.headers;
        headers.Authorization = headers.authorization;
        Reflect.deleteProperty(headers, 'authorization');
        return next(options);
      }
    ]
  }),

  createPlmBase = ({username, password, host, port}) => {
    let hubInfo;

    const authHeader = () => {
        const data = Buffer.from(`${username}:${password}`),
          base64Data = data.toString('base64');
        return `Basic ${base64Data}`;
      },

      toHex = (value, length = 2) => value.toString(16)
        .padStart(length, '0').toUpperCase().substr(0, length),

      parseXml = xml => xml.split(/\r?\n/).reduce(
        (result, line) => {
          const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/) ||
            line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+><([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/) ||
            line.match(/^<([A-Z]+) D="([ !#-~]+)"\/>$/);

          if (match) {
            result[match[1]] = match[2].trim();
            if (match[3]) {
              result[match[3]] = match[4].trim();
            }
          }
          return result;
        },
        {}
      ),

      parseHubInfo = response => {
        return response.split('\n').reduce(
          (info, line) => {
            let m;
            if ((m = line.match(/((Hub[0-9])-V[-0-9]+)/))) {
              info.binVersion = m[1];
              info.type = m[2];
            } else if ((m = line.match(/Firmware:([0-9]+) +Build ([ :a-zA-Z0-9]+)/))) {
              info.hubVersion = m[1];
              info.firmwareBuildDate = m[2];
            } else if ((m = line.match(/PLM Version:([ :a-zA-Z0-9]+)/))) {
              info.firmware = m[1];
            } else if ((m = line.match(/Insteon ID:([. :a-zA-Z0-9]+)/))) {
              info.imId = m[1].replace(/[.]/g, '');
            }
            return info;
          },
          {}
        );
      },

      sendImRequest = async (command) => {
        const url = `http://${host}:${port}/${command}`,
          options = {
            headers: {
              Authorization: authHeader()
            },
            dnsCache: false,
            retry: 0
          },
          response = await got(url, options);

        return response.body;
      },

      // Insteon Commands
      sendAllLinkCommand = async (command, groupNumber = 0) => {
        return await sendImRequest(`0?${command}${toHex(groupNumber)}=I=0`);
      },

      sendDeviceControlCommand = buffer => {
        return sendImRequest(`3?${buffer}=I=3`);
      },

      // https://blog.automategreen.com/post/under-the-insteon-hub-hood/
      sendInsteonCommandSync = async (deviceId, command) => {
        return parseXml(await sendImRequest(`sx.xml?${deviceId}=${command}`));
      },

      // Hub Commands
      clearBuffer = () => sendImRequest('1?XB=M=1'),

      // Buffer Commands
      getBuffer = async () => {
        const bufferXml = await sendImRequest('buffstatus.xml'),
          match = bufferXml.match(/<BS>([0-9A-F]+)</);
        return match && match[1];
      },

      setUsernamePassword = (newUsername, newPassword) =>
        sendImRequest(`1?L=${newUsername}=1=${newPassword}`),

      // https://blog.automategreen.com/post/under-the-insteon-hub-hood/
      // https://openremote.github.io/archive-dotorg/forums/attachments/22882151/23036480.pdf
      createScene = ({
        sceneNumber,
        sceneName,
        show
      }) => sendImRequest(`2?S${sceneNumber}=${sceneName}=2=${show ? 't' : 'f'}`),

      getHubInfo = async () => {
        if (!hubInfo) {
          hubInfo = parseHubInfo(await sendImRequest('index.htm'));
        }
        return hubInfo;
      },

      getHubStatus = async () => {
        const timeAndDay = parseXml(await sendImRequest('status.xml')),
          linkStatus = parseXml(await sendImRequest('Linkstatus.xml')),
          statusD = parseXml(await sendImRequest('statusD.xml')),
          hubStatus = {};

        hubStatus.day = timeAndDay.DAY;
        hubStatus.time = timeAndDay.FRT;
        hubStatus.cls = linkStatus.CLS;
        hubStatus.clsg = linkStatus.CLSG;
        hubStatus.clsi = linkStatus.CLSI;
        hubStatus.cds = statusD.CDS;
        return hubStatus;
      };

    return Object.freeze({
      clearBuffer,
      createScene,
      getBuffer,
      getHubInfo,
      getHubStatus,
      sendAllLinkCommand,
      sendDeviceControlCommand,
      sendInsteonCommandSync,
      setUsernamePassword
    });
  };

exports.createPlmBase = createPlmBase;
