<div id="cityair2" class="ca2__main">
  <div class="ca2__title">
    <div class="ca2__column ca2__date">
      <?php if(LANGUAGE_ID=="ru"): ?>
        СЕЙЧАС В СКОЛКОВО
      <?php else: ?>
        NOW IN SKOLKOVO
      <?php endif; ?>
    </div>
    <div class="ca2__column ca2__more">
      <?php if(LANGUAGE_ID=="ru"): ?>
        Подробнее на&nbsp;<a href="//cityair.io" title="Подробнее">cityair.io</a>
      <?php else: ?>
        For details&nbsp; <a href="//cityair.io" title="Details">cityair.io</a>
      <?php endif; ?>
    </div>
  </div>
  <div class="ca2__content">
    <div class="ca2__row">
      <div class="ca2__item ca2__item_temp" name="Temperature">
        <span class="ca2__item-data"></span>
      </div>
      <div class="ca2__item ca2__item_rh" name="Humidity">
        <div class="ca2__item-title">
          <?php if(LANGUAGE_ID=="ru"): ?>
            Влажность
          <?php else: ?>
            Humidity
          <?php endif; ?>
        </div>
        <div class="ca2__item-data"></div>
      </div>
      <div class="ca2__item ca2__item_p" name="Pressure">
        <div class="ca2__item-title">
          <?php if(LANGUAGE_ID=="ru"): ?>
            Давление
            <?php else: ?>
              Pressure
            <?php endif; ?>
        </div>
        <div class="ca2__item-data"></div>
      </div>
    </div>
    <div class="ca2__row">
      <div class="ca2__item ca2__item_aqi" name="AQI">
        <div class="ca2__item-title"></div>
        <div class="ca2__item-data"></div>
        <div class="ca2__comment"></div>
      </div>
    </div>
  </div>
</div>
