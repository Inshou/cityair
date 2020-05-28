(function () {
  var config = {
    serial: "CA01PM000195",
    base: "https://airvoice.io/api/request-open.php?map=/MoApi2/",
    baseRequest: {
      "Filter": {
        "MoId": 291,
        "IntervalType": 2,
        "FilterType": 3,
        "SkipFromLast": 0,
        "TakeCount": 3
      },
      "Token": "669a8d12-ddfd-45db-8285-86c0b1e084c2"
    },
    id: ".ca2__main"
  };

  var AQI_DATA = {
    1: {
      label: {
        ru: "Низкий уровень загрязнения",
        en: "Low pollution level"
      },
      comment: {
        ru: "Нам повезло!",
        en: "How lucky we are!"
      }
    },
    2: {
      label: {
        ru: "Низкий уровень загрязнения",
        en: "Low pollution level"
      },
      comment: {
        ru: "Почти идеальный воздух",
        en: "Almost perfect"
      }
    },
    3: {
      label: {
        ru: "Низкий уровень загрязнения",
        en: "Low pollution level"
      },
      comment: {
        ru: "Все хорошо, для города даже отлично",
        en: "For cities - it's good"
      }
    },
    4: {
      label: {
        ru: "Средний уровень загрязнения",
        en: "Medium pollution level"
      },
      comment: {
        ru: "Хуже, чем хотелось бы",
        en: "Could be better"
      }
    },
    5: {
      label: {
        ru: "Средний уровень загрязнения",
        en: "Medium pollution level"
      },
      comment: {
        ru: "Не отлично, но и не ужасно",
        en: "Not great, not terrible"
      }
    },
    6: {
      label: {
        ru: "Средний уровень загрязнения",
        en: "Medium pollution level"
      },
      comment: {
        ru: "Лучше ограничить активность на улице",
        en: "Better limit outdoor activities"
      }
    },
    7: {
      label: {
        ru: "Высокий уровень загрязнения",
        en: "High pollution level"
      },
      comment: {
        ru: "Ситуация настораживает",
        en: "This is disturbing"
      }
    },
    8: {
      label: {
        ru: "Высокий уровень загрязнения",
        en: "High pollution level"
      },
      comment: {
        ru: "Лучше побыть дома",
        en: "Better stay home"
      }
    },
    9: {
      label: {
        ru: "Высокий уровень загрязнения",
        en: "High pollution level"
      },
      comment: {
        ru: "Воздух уже должно быть видно",
        en: "Air should be visible now"
      }
    },
    10: {
      label: {
        ru: "Высокий уровень загрязнения",
        en: "High pollution level"
      },
      comment: {
        ru: "Ой :(",
        en: "Oh :("
      }
    },
  };

  var AQI_CHANGE = {
    better: {
      ru: "Воздух становится чище",
      en: "Air quality is becoming better"
    },
    nochange: {
      ru: "Качество воздуха пока не меняется",
      en: "Air quality remains the same"
    },
    worse: {
      ru: "Воздух становится грязнее",
      en: "Air quality is becoming worse"
    }
  }

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
      Token: config.baseRequest["Token"],
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
    var callback = function(data) {
      device = JSON.parse(data);
      if (device && !device.IsError && device.Result) {
        deviceId = device.Result.Devices[0].DeviceId;
        valueTypes = device.Result.PacketValueTypes;
      }
      getPackets(deviceId);
    };
    if (serial) data = { Filter : { SerialNumber: serial } };

    baseRequest(config.base + 'GetMoItems', data, 'POST', callback);
  }

  /* Get data request */
  function getPackets(id) {
    var data = { Filter: config.baseRequest["Filter"] };
    var callback = function(result) {
      if (result) mapData(JSON.parse(result));
    };
    return baseRequest(config.base + 'GetMoPackets', data, 'POST', callback);
  }

  /* Finish mapping values */
  function mapValues(value) {
    if (value && valueTypes) {
      var vTInfo = (valueTypes.filter(function(vT) {
        return value.VT === vT.ValueType;
      }));
      if (vTInfo && vTInfo[0]) {
        if(vTInfo[0]["TypeName"]=="Pressure") value["V"] = parseInt(value["V"]);
        if(vTInfo[0]["TypeName"]=="Temperature") value["V"] = parseInt(value["V"]);
        if(vTInfo[0]["TypeName"]=="Humidity") value["V"] = parseInt(value["V"]);

        if (mappedData.filter(data => data["VT"] === value["VT"]).length > 0) {
          for (var idx = 0; idx < mappedData.length; idx++) {
            if (mappedData[idx]["VT"] === value["VT"]) {
              mappedData[idx] = mergeObjects(vTInfo[0], value);
            }
          }
        } else {
          mappedData.push(mergeObjects(vTInfo[0], value));
        }
      }
    }
  }

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



    if (mappedData[5] && mappedData[5]["TypeName"] === "AQI") {
      var prev = mappedData[5].overall;
      mappedData[5] = {
        IsHidden: false,
        TypeName: "AQI",
        TypeNameRu: "Качество воздуха",
        label: AQI_DATA[overall],
        TypeOrder: 0,
        V: `(AQI: ${overall}/10)`,
        overall,
        prev,
        change: overall > prev ? AQI_CHANGE.worse : ( overall === prev ? AQI_CHANGE.nochange : AQI_CHANGE.better)
      };
    } else {
      mappedData.push({
        IsHidden: false,
        TypeName: "AQI",
        TypeNameRu: "Качество воздуха",
        TypeOrder: 0,
        V: `(AQI: ${overall}/10)`,
        overall
      });
    }
  }

  /* Result data first mapping */
  function mapData(data) {
    if (data && !data.IsError && data.Result) {
      for (let idx = 0; idx < data.Result.Packets.length; idx++ ) {
        var i = data.Result.Packets[idx]["Data"].length;
        while (i--) {
          mapValues(data.Result.Packets[idx]["Data"][i])
        }
        setAQI(mappedData);
      }
      renderData(mappedData);
    }
  }

  /* Data rendering */
  function renderData(data) {
    if (data.constructor === Array && data.length > 0) {
      data.forEach(function(item) {
        var el, container, target, comment, title;
        containers = document.querySelectorAll(config.id);
        containers.forEach(container => {
          el = container.querySelectorAll('div[name="'+item['TypeName']+'"]');
          console.log('container',container);
          if (el && el.length > 0) {
            target = el[0].getElementsByClassName("ca2__item-data");
            title = el[0].getElementsByClassName("ca2__item-title");
            comment = el[0].getElementsByClassName("ca2__comment");
          }
          if (target && target.length > 0) {
            if (typeof item['TypeName'] !== 'undefined' && item['TypeName'] === 'AQI') {
              target[0].innerHTML = ``;
              comment[0].innerHTML = lang === "ru" ? item["change"]["ru"] : item["change"]["en"];
              title[0].innerHTML = `${item["label"]["label"][lang]} ${item["V"]}. ${item["label"]["comment"][lang]}`;
            } else {
              target[0].innerHTML = `<div class="ca2__item-value">${item["V"]}</div><div class="ca2__item-measure">${lang == "ru" ? item["MeasurementRu"] || '' : item["Measurement"] || ''}</div>`;
            }
          }
        });
      })
    }
  }

  /* Init function start */
  getDevices(config.serial);

  setInterval(function () { getDevices(config.serial); }, 5 * 60000);

})(window, document);

