'use strict';
const got = require('got'),

  createPlmBase = ({username, password, host, port}) => {
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
          (hubInfo, line) => {
            let m;
            if ((m = line.match(/((Hub[0-9])-V[-0-9]+)/))) {
              hubInfo.binVersion = m[1];
              hubInfo.type = m[2];
            } else if ((m = line.match(/Firmware:([0-9]+) +Build ([ :a-zA-Z0-9]+)/))) {
              hubInfo.hubVersion = m[1];
              hubInfo.firmwareBuildDate = m[2];
            } else if ((m = line.match(/PLM Version:([ :a-zA-Z0-9]+)/))) {
              hubInfo.plmVersion = m[1];
            } else if ((m = line.match(/Insteon ID:([. :a-zA-Z0-9]+)/))) {
              hubInfo.deviceId = m[1].replace(/[.]/g, '');
            }
            return hubInfo;
          },
          {}
        );
      },

      sendImRequest = async (command) => {
        const url = `http://${host}:${port}/${command}`,
          response = await got(
            url,
            {
              headers: {
                Authorization: authHeader()
              },
              dnsCache: false
            }
          );
        return response.body;
      },

      // Insteon Commands
      sendAllLinkCommand = async (command, groupNumber = 0) => {
        return await sendImRequest(`0?${command}${toHex(groupNumber)}=I=0`);
      },

      sendDeviceControlCommand = buffer => sendImRequest(`3?${buffer}=I=3`),

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

      setUsernamePassword = (username, password) =>
        sendImRequest(`1?L=${username}=1=${password}`),

      // https://blog.automategreen.com/post/under-the-insteon-hub-hood/
      createScene = ({
        sceneNumber,
        sceneName,
        show
      }) => sendImRequest(`2?S${sceneNumber}=${sceneName}=2=${show ? 't' : 'f'}`),

      getHubInfo = async () =>
        parseHubInfo(await sendImRequest('index.htm')),

      getLinkStatus = async () =>
        parseXml(await sendImRequest('Linkstatus.xml')),

      getCurrentTime = async () =>
        parseXml(await sendImRequest('rstatus.xml')).RT,

      getCurrentTimeAndDay = async () =>
        parseXml(await sendImRequest('status.xml')),

      getStatusD = async () =>
        parseXml(await sendImRequest('statusD.xml'));

    return Object.freeze({
      sendAllLinkCommand,
      sendDeviceControlCommand,
      sendInsteonCommandSync,
      clearBuffer,
      getBuffer,
      setUsernamePassword,
      createScene,
      getHubInfo,
      getLinkStatus,
      getCurrentTime,
      getCurrentTimeAndDay,
      getStatusD
    });
  };

exports.createPlmBase = createPlmBase;
