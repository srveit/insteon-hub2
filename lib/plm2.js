'use strict';

const {createPlmBase} = require('./plmBase'),

 createPlm = ({username, password, host, port, deviceNames, parsingLogger}) => {
   const plmBase = createPlmBase({username, password, host, port}),

     getHubStatus = async () => {
       const hubInfo = await plmBase.getHubInfo(),
         timeAndDay = await plmBase.getCurrentTimeAndDay(),
         linkStatus = await plmBase.getLinkStatus(),
         statusD = await plmBase.getStatusD(),
         hubStatus = {...hubInfo};

       hubStatus.day = timeAndDay.DAY;
       hubStatus.time = timeAndDay.FRT;
       hubStatus.cls = linkStatus.CLS;
       hubStatus.clsg = linkStatus.CLSG;
       hubStatus.clsi = linkStatus.CLSI;
       hubStatus.cds = statusD.CDS;
       return hubStatus;
     },

      setUsernamePassword = (username, password) =>
        plmBase.setUsernamePassword(username, password);

   return Object.freeze({
     getHubStatus,
     setUsernamePassword
   });
 };

exports.createPlm = createPlm;
