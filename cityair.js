(function () {
  var config = {
    login: "pchernyshev",
    password: "4IeAh1t6#cY2v8@L",
    //serial: "CA01PM000195",
    serial: "CA01PM000255",
    base: "https://cityair.io/backend-api/request-v2.php?map=/DevicesApi2/",
    id: "cityair",
  };

  /* Global variables */
  var device, deviceId, valueTypes, mappedData = [];
  var lang = document.location.pathname.indexOf("/en") === 0 ? "en" : "ru";

  /* Vanilla objects merge */
  function mergeObjects(){
    var res = {};
    for(var i = 0;i<arguments.length;i++){
      for(x in arguments[i]){
        res[x] = arguments[i][x];
      };
    };
    return res;
  };

  /* Base request */
  function baseRequest(url, data, method, callback) {
    var xhr = new XMLHttpRequest();
    var contentType = "application/json";
    var base = {
      User: config.login,
      Pwd: config.password,
    };
    var payload = JSON.stringify(mergeObjects(base, data));

    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.send(payload);

    xhr.onload = function() {
      if (xhr.status !== 200) console.warn(`Request error ${xhr.status}: ${xhr.statusText}`);
      else callback(xhr.response);
    };

    xhr.onerror = function(err) {
      console.warn(`Request failed ${err}`);
    };
  }

  /* Get device params request */
  function getDevices(serial) {
    var data;

    /* Device data request callback */
    var callback = function(data) {
        device = JSON.parse(data);
        if (device && !device.IsError) {
          deviceId = device.Result.Devices[0].DeviceId;
          valueTypes = device.Result.PacketsValueTypes;
        } else {
          console.warn('Device get error');
        }
      /* If we have device ID get data from Device */
      if (deviceId) getPackets(deviceId);
    };

    /* If we have serial, get Device */
    if (serial) {
      data = { Filter : { SerialNumber: serial }};
      baseRequest(config.base + 'getDevices', data, 'POST', callback);
    }
  }

  /* Get data from Device */
  function getPackets(id) {
    var data = { Filter: { DeviceId: id, FilterType: 3, Take: 3, Skip: 0 }};
    var callback = function(result) {
      if (result) mapData(JSON.parse(result));
    };
    return baseRequest(config.base + 'getPackets', data, 'POST', callback);
  }

  /* Finish mapping values */
  function mapValues(value) {
    if (value && valueTypes) {
      var vTInfo = (valueTypes.filter(function(vT) {
        return value.VT === vT.ValueType;
      }));
      if (vTInfo && vTInfo[0]) {
        if(vTInfo[0]["TypeName"]=="Pressure") value["V"] = parseInt(value["V"]*100)/100;
        mappedData.push(mergeObjects(vTInfo[0], value));
        if(vTInfo[0]["TypeName"]=="PM2.5") value["TypeNameRu"] = "частицы <2,5 мкм";
        mappedData.push(mergeObjects(vTInfo[0], value));
        if(vTInfo[0]["TypeName"]=="PM10") value["TypeNameRu"] = "частицы <10 мкм";
        mappedData.push(mergeObjects(vTInfo[0], value));
      }
    }
  }

  /* Set Air quality index */
  /*                              PM2.5       PM10
  1 Отлично                       0 - 10      0 - 19
  2 Хорошо                        11 - 22     20 - 39
  3 Нормально                     23 - 34     40 - 59
  4 Требует осмотрительности      35 - 65     60 - 119
  5 Небезопасно для аллергиков    66 - 96     120 - 179
  6 Небезопасно                   97 - 127    180 - 239
  7 Вредно                        128 - 159   240 - 299
  8 Очень вредно                  160 - 284   300 - 539
  9 Опасно для здоровья           285 - 409   540 - 779
  10 Критически опасно            более 410   более 780
   */
  function setAQI(data) {
    var pm25 = data.filter(function(item) { return item["TypeName"] === "PM2.5"})[0];
    var pm10 = data.filter(function(item) { return item["TypeName"] === "PM10"})[0];

    var pm25level, pm10level, overall;

    if (!pm25 || !pm10) return;

    if (parseInt(pm25["V"]) < 11 ) pm25level = 1;
    else if (parseInt(pm25["V"]) < 23 ) pm25level = 2;
    else if (parseInt(pm25["V"]) < 35 ) pm25level = 3;
    else if (parseInt(pm25["V"]) < 66 ) pm25level = 4;
    else if (parseInt(pm25["V"]) < 97 ) pm25level = 5;
    else if (parseInt(pm25["V"]) < 128 ) pm25level = 6;
    else if (parseInt(pm25["V"]) < 160 ) pm25level = 7;
    else if (parseInt(pm25["V"]) < 285 ) pm25level = 8;
    else if (parseInt(pm25["V"]) < 410 ) pm25level = 9;
    else pm25level = 10;

    if (parseInt(pm10["V"]) < 20 ) pm10level = 1;
    else if (parseInt(pm10["V"]) < 40 ) pm10level = 2;
    else if (parseInt(pm10["V"]) < 60 ) pm10level = 3;
    else if (parseInt(pm10["V"]) < 120 ) pm10level = 4;
    else if (parseInt(pm10["V"]) < 180 ) pm10level = 5;
    else if (parseInt(pm10["V"]) < 240 ) pm10level = 6;
    else if (parseInt(pm10["V"]) < 300 ) pm10level = 7;
    else if (parseInt(pm10["V"]) < 540 ) pm10level = 8;
    else if (parseInt(pm10["V"]) < 780 ) pm10level = 9;
    else pm10level = 10;

    if (pm25level > pm10level) overall = pm25level;
    else overall = pm10level;

    if (overall === 1) ruLabel = "балл";
    else if (overall < 5) ruLabel = "балла";
    else ruLabel = "баллов";

    mappedData.push({
      IsHidden: false,
      Measurement: "points",
      MeasurementRu: ruLabel,
      TypeName: "AQI",
      TypeNameRu: "Качество воздуха (от 1 до 10: Отлично - Критично)",
      TypeOrder: 0,
      V: overall
    });
  }

  /* Result data prepare mapping */
  function mapData(data) {
    if (data && !data.IsError) {
      var i = data.Result.Packets.length;
      var lastData;
      while (i--) {
        var j = data.Result.Packets[i]["Data"].length;
        while (j--) {
          mapValues(data.Result.Packets[i]["Data"][j])
        }
      }

      setAQI(mappedData);
      renderData(mappedData);
    }
  }

  /* Data rendering */
  function renderData(data) {
    if (data.constructor === Array && data.length > 0) {

      data.forEach(function(item) {
        var el, target;

        el = document.getElementsByName(item.TypeName);
        if (item.TypeName === "AQI") {
          if (el && el.length > 0) {
            target = el[0].getElementsByClassName("ca__data");
            target && target[0] && target[0].classList.add('__' + item["V"]);
          }
        }
        if (el && el.length > 0) {
          target = el[0].getElementsByClassName("ca__data");
          title = el[0].getElementsByClassName("ca__title");
        }
        if (target && target.length > 0) {
          target[0].innerHTML = `<span class="value">${item["V"]} ${lang == "ru" ? item["MeasurementRu"] : item["Measurement"]}</span><span class="help">${item["TypeNameRu"] && lang === "ru" ? item["TypeNameRu"] : item["TypeName"]}</span>`;
          title[0].innerHTML =  `<span class="value">${title[0].innerHTML}</span>`
        }
      })

     var container = document.getElementById(config.id);
     if (container) container.style.display = '';
    }
  }

  /* Init function start */
  getDevices(config.serial);

})(window, document);
