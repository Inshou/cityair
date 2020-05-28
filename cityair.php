  <div id="cityair" class="ca__main" style="display: none;">
      <div class="ca__item ca__item_aqi" name="AQI">
        <div class="ca__title">AQI</div>
        <div class="ca__data"></div>
      </div>
      <div class="ca__item ca__item_t" name="Temperature">
        <div class="ca__title">T</div>
        <div class="ca__data"></div>
      </div>
      <div class="ca__item ca__item_p" name="Pressure">
        <div class="ca__title">P</div>
        <div class="ca__data"></div>
      </div>
      <div class="ca__item ca__item_rh" name="Humidity">
        <div class="ca__title">RH</div>
        <div class="ca__data"></div>
      </div>
      <div class="ca__item ca__item_pm25" name="PM2.5">
        <div class="ca__title">PM2.5</div>
        <div class="ca__data"></div>
      </div>
      <div class="ca__item ca__item_pm10" name="PM10">
        <div class="ca__title">PM10</div>
        <div class="ca__data"></div>
      </div>
      <a href="https://cityair.io/" class="ca__logo" target="_blank">
        <img src="/bitrix/templates/sk/cityair/logo_ca.svg" />
      </a>
      <div class="ca__logo-help">
        <?php if(LANGUAGE_ID=="ru"): ?>
          <div class="title"><strong>Данные о загрязнителях/метеоданные</strong></div>
          <div class="data">ул. Зворыкина 1, к4 Экспериментальная станция CityAir</div>
        <?php else: ?>
          <div class="title"><strong>CityAir experimental station</strong></div>
          <div class="data">Zvorykina str, 1</div>
        <?php endif; ?>
      </div>
</div>
