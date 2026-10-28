export const gameMarkup = `
<input type="text" id="mobilehelper" />
<div id="S2">
  <div class="S2a">
    &nbsp; &nbsp; <span class="cap">T</span>aipan,<br /><br />
    <span class="cap">W</span>hat will you name your<br /><br />
    &nbsp; &nbsp; <span class="cap">F</span>irm: <span id="S2b"></span><br />
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; <span class="S2c">----------------------</span>
  </div>
</div>
<div id="S3">
  <div class="S3a">
    <span class="cap">D</span>o you want to start &nbsp;. &nbsp;. &nbsp;.<br /><br />
    &nbsp; &nbsp; 1) <span class="cap">W</span>ith cash (and a debt)<br /><br />
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;&gt;&gt; or &lt;&lt;<br /><br />
    &nbsp; &nbsp; 2) <span class="cap">W</span>ith five guns and no cash<br /><br />
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;(<span class="cap">B</span>ut no debt!)<br /><br />
    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;? <span id="S3b"></span>
  </div>
</div>
<div id="S4">
  <div class="p1">
    <span class="cap">F</span>irm: <span id="H" class="cap"></span>, <span class="cap">H</span>ong <span class="cap">K</span>ong
  </div>
  <table>
    <tr>
      <td>
        <div class="p2">
          <span class="cap">H</span>ong <span class="cap">K</span>ong <span class="cap">W</span>arehouse<br />
          <table>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">O</span>pium</td>
              <td class="c30"><span id="w0">0</span></td>
              <td class="c30"><span class="cap">I</span>n use:</td>
            </tr>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">S</span>ilk</td>
              <td class="c30"><span id="w1">0</span></td>
              <td class="c30">&nbsp;<span id="WS">0</span></td>
            </tr>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">A</span>rms</td>
              <td class="c30"><span id="w2">0</span></td>
              <td class="c30"><span class="cap">V</span>acant:</td>
            </tr>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">G</span>eneral</td>
              <td class="c30"><span id="w3">0</span></td>
              <td class="c30">&nbsp;<span id="WC">10,000</span></td>
            </tr>
          </table>
        </div>
      </td>
      <td rowspan="2" class="vtop">
        <div class="p3">
          <span class="cap">D</span>ate<br />
          15 <span class="inverse"><span id="month0" class="cap">J</span><span id="month1">an</span></span> <span id="year">1860</span><br /><br />
          <span class="cap">L</span>ocation<br />
          <span id="location" class="inverse"><span class="cap">H</span>ong <span class="cap">K</span>ong</span><br /><br />
          <span class="cap">D</span>ebt<br />
          <span id="DW" class="inverse">0</span><br /><br />
          <span class="cap">S</span>hip status<br />
          <span id="DM"><span class="cap">P</span>erfect</span>
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <div class="p2">
          <table>
            <tr>
              <td colspan="2"><span class="cap">H</span>old <span id="MW">0</span></td>
              <td class="c30r"><span class="cap">G</span>uns&nbsp;</td>
              <td class="c30"><span id="GN">0</span></td>
            </tr>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">O</span>pium</td>
              <td class="c30"><span id="h0">0</span></td>
              <td class="c30">&nbsp;</td>
            </tr>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">S</span>ilk</td>
              <td class="c30"><span id="h1">0</span></td>
              <td class="c30">&nbsp;</td>
            </tr>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">A</span>rms</td>
              <td class="c30"><span id="h2">0</span></td>
              <td class="c30">&nbsp;</td>
            </tr>
            <tr>
              <td class="c10">&nbsp;</td>
              <td class="c30"><span class="cap">G</span>eneral</td>
              <td class="c30"><span id="h3">0</span></td>
              <td class="c30">&nbsp;</td>
            </tr>
          </table>
        </div>
      </td>
    </tr>
  </table>
  <div class="p4">
    <table>
      <tr>
        <td class="c50">
          <span class="cap">C</span>ash: <span id="CA">0</span>
        </td>
        <td class="c50">
          <span class="cap">B</span>ank: <span id="BA">0</span>
        </td>
      </tr>
    </table>
  </div>
  <div class="solidline"></div>
  <div id="message" class="p4"></div>
</div>
<div id="S5">
  <div class="f0">
    <div><span id="SN">0</span> ships attacking, <span class="cap">T</span>aipan!</div>
    <div id="f2"></div>
    <div>&nbsp;</div>
    <div id="f4"></div>
    <div class="guns"><span class="cap">W</span>e have<br/><span id="GNs">0</span> guns</div>
  </div>
  <div class="sf" id="sf0"></div><div class="sf" id="sf1"></div><div class="sf" id="sf2"></div><div class="sf" id="sf3"></div><div class="sf" id="sf4"></div>
  <div id="plus"></div>
  <div class="sf" id="sf5"></div><div class="sf" id="sf6"></div><div class="sf" id="sf7"></div><div class="sf" id="sf8"></div><div class="sf" id="sf9"></div>
  <div id="ef"></div>
</div>
<div id="S6">
  <span class="cap">Y</span>our final status:
  <br /><br />
  <span class="cap">N</span>et <span class="cap">C</span>ash: <span id="CAf">0</span>
  <br /><br />
  <span class="cap">S</span>hip size: <span id="SCf">0</span> units with <span id="GNf">0</span> guns
  <br /><br />
  <span class="cap">Y</span>ou traded for <span id="YEARSf">0</span> and <span id="MONTHSf">0</span>
  <br /><br />
  <span class="inverse"><span class="cap">Y</span>our score is <span id="SCOREf">0</span>.</span>
  <br /><br /><br /><br />
  <span class="cap">Y</span>our <span class="cap">R</span>ating:<br />
  <div class="scorecard"><table>
    <tr>
      <td class="c50">
        <span id="SCORE5f"><span class="cap">M</span>a <span class="cap">T</span>su</span>
      </td>
      <td class="c50r">
        50,000 and over&nbsp;
      </td>
    </tr>
    <tr>
      <td class="c50">
        <span id="SCORE4f"><span class="cap">M</span>aster <span class="cap">T</span>aipan</span>
      </td>
      <td class="c50r">
        8,000 to 49,999
      </td>
    </tr>
    <tr>
      <td class="c50">
        <span id="SCORE3f"><span class="cap">T</span>aipan</span>
      </td>
      <td class="c50r">
        1,000 to &nbsp;7,999
      </td>
    </tr>
    <tr>
      <td class="c50">
        <span id="SCORE2f"><span class="cap">C</span>ompradore</span>
      </td>
      <td class="c50r">
        500 to &nbsp; &nbsp;999
      </td>
    </tr>
    <tr>
      <td class="c50">
        <span id="SCORE1f"><span class="cap">G</span>alley <span class="cap">H</span>and</span>
      </td>
      <td class="c50r">
        less than 500
      </td>
    </tr>
  </table></div>
  <br /><br />
  <button type="button" id="play-again" class="play-again"><span class="cap">P</span>lay again</button>
</div>
`
