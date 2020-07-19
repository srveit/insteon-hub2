'use strict';
const got = require('got'),

  createPlmBase = ({username, password, host, port}) => {
    const authHeader = () => {
      const data = Buffer.from(`${username}:${password}`),
        base64Data = data.toString('base64');
      return `Basic ${base64Data}`;
    },

      toHex = (value = 0, length = 2) => value.toString(16)
        .padStart(length, '0').toUpperCase().substr(0, length),

      parseStatus = xml => xml.split('\n').reduce(
        (linkStatus, line) => {
          const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>\r?$/) ||
            line.match(/^<([A-Z]+) D="([ !#-~]+)"\/>\r?$/);

          if (match) {
            linkStatus[match[1]] = match[2].trim();
          }
          return linkStatus;
        },
        {}
      ),

      sendImRequest = async (command = '') => {
        const url = `http://${host}:${port}/${command}`,
          response = await got(
            url,
            {
              headers: {
                Authorization: authHeader()
              }
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
        const response = await sendImRequest(`sx.xml?${deviceId}=${command}`);
        return parseStatus(response);
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

      // TODO:
      // This URL will get you all the device ids on room 1 in XML format
      // http://X.X.X.X:25105/b.xml?01=1=F
      getBs = async () => {
        const xml = await sendImRequest('b.xml');
        return xml.split('\n').reduce(
          (bs, line) => {
            const match = line.match(/^<S D="([ !#-~]+)"\/>$/);

            if (match) {
              bs.push(match[1]);
            }
            return bs;
          },
          []
        );
      },

      getHubInfo = async () => {
        const response = await sendImRequest('index.htm');
        return parseHubInfo(response);
      },

      getLinkStatus = async () => {
        const xml = await sendImRequest('Linkstatus.xml');
        return parseStatus(xml);
      },

      getRstatus = async () => {
        const xml = await sendImRequest('rstatus.xml');
        return xml.split('\n').reduce(
          (status, line) => {
            const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/);

            if (match) {
              status[match[1]] = match[2].trim();
            }
            return status;
          },
          {}
        );
      },

      getStatus = async () => {
        const xml = await sendImRequest('status.xml');
        return xml.split('\n').reduce(
          (status, line) => {
            const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+><([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/);

            if (match) {
              status[match[1]] = match[2].trim();
              status[match[3]] = match[4].trim();
            }
            return status;
          },
          {}
        );
      },

      getRstatusD = async () => {
        const xml = await sendImRequest('statusD.xml');
        return xml.split('\n').reduce(
          (status, line) => {
            const match = line.match(/^<([A-Z]+)>([ -;=-~]+)<\/[A-Z]+>$/);

            if (match) {
              status[match[1]] = match[2].trim();
            }
            return status;
          },
          {}
        );
      },

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
      };

    return Object.freeze({
      sendAllLinkCommand,
      sendDeviceControlCommand,
      sendInsteonCommandSync,
      clearBuffer,
      setUsernamePassword,
      getBuffer,
      getLinkStatus
    });
  };

exports.createPlmBase = createPlmBase;
