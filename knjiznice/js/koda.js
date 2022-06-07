//Potrebne spremenljivke
const TEACHING_API_BAZA = "anzeljc7";
const SENSEI_RACUN = "0xA3ea3590645c69db5E6A65c5646469A73f29ee56";
let SENSEI_BC_RPC_URL = "https://sensei.lavbic.net:8546";
let TEACHING_API_BASE_URL =
  "https://teaching.lavbic.net/api/OIS/baza/" + TEACHING_API_BAZA + "/podatki/";
const COINPAPRIKA_API_BASE_URL = "https://api.coinpaprika.com/v1/";

const web3 = new Web3(SENSEI_BC_RPC_URL);
let seznamDodanih;

/**
 * Generator podatkov za novega uporabnika, ki bo uporabljal aplikacijo. Pri
 * generiranju podatkov je potrebno najprej kreirati nov scenarij s specifičnimi
 * podatki, ki se nanašajo na scenarij.
 *
 * @param stScenarija zaporedna številka scenarija (1, 2 ali 3)
 * @return scenarijId generiranega scenarija
 */
function generirajScenarij(stScenarija, cb) {
  scenarijId = "";
  let scenarij = {
    podatki: {},
    danes: {},
    latest: {},
    events: {},
    twits: {},
    history: {},
  };

  if (stScenarija === 1) {
    scenarij.podatki = {
      description:
        "Bitcoin is a cryptocurrency and worldwide payment system. It is the first decentralized digital currency, as the system works without a central bank or single administrator.",
      id: "btc-bitcoin",
      name: "Bitcoin",
      open_source: true,
      org_structure: "Decentralized",
      rank: 1,
      started_at: "2009-01-03T00:00:00Z",
      symbol: "BTC",
      type: "coin",
    };
    pridobiOstalePodatke(scenarij, "btc-bitcoin", cb);
  } else if (stScenarija === 2) {
    scenarij.podatki = {
      description:
        "Ethereum is a decentralized platform for applications. Applications build on it can use smart contracts - computer algorithms which execute themselves when data is supplied to the platform. There is no need for any human operators.",
      id: "eth-ethereum",
      name: "Ethereum",
      open_source: true,
      org_structure: "Semi-centralized",
      rank: 2,
      started_at: "2015-07-30T00:00:00Z",
      symbol: "ETH",
      type: "coin",
    };

    pridobiOstalePodatke(scenarij, "eth-ethereum", cb);
  } else if (stScenarija === 3) {
    scenarij.podatki = {
      description:
        "Tether (USDT) is a cryptocurrency with reference to fiat currencies that is issued by Tether Limited Company.\r\nUsing the technology of Blockchain, Tether allows the users to keep, send and receive digital tokens pegged to dollars, euros and yens*.\r\n\r\n*1USDT =/= 1USD - according to ToS (Terms-of-service) of Tether Limited Company - Tether tokens are not money, although they are backed by the currency used to purchase them at issuance.",
      id: "usdt-tether",
      last_data_at: "2022-05-09T16:30:00Z",
      name: "Tether",
      open_source: false,
      org_structure: "Centralized",
      rank: 3,
      started_at: "2015-02-25T00:00:00Z",
      symbol: "USDT",
      type: "token",
    };

    pridobiOstalePodatke(scenarij, "usdt-tether", cb);
  }
  return scenarijId;
}

function generirajPodatke() {
  ustvariToast("Data is being generated, please wait a moment...");

  izbrisiVsePodatke("");

  posodobiPodatek([], "donacije", () => { });
  pridobiSeznamCoinov((data) => {
    let newData = data.slice(3, 104);
    posodobiPodatek(newData, "seznam", () => { });
    for (let i = 0; i < newData.length; i++) {
      $("#datalistOptions").append(
        "<option  " + "value='" + newData[i].id + "' ></option > "
      );
    }
  });

  generirajScenarij(1, () => {
    generirajScenarij(2, () => {
      generirajScenarij(3, () => {
        posodobiPodatek(
          ["usdt-tether", "eth-ethereum", "btc-bitcoin"],
          "seznamDodanih",
          () => {
            seznamDodanih = ["usdt-tether", "eth-ethereum", "btc-bitcoin"];
            posodobiSeznamKart();
            izbrisiToast();
          }
        );


      });
    });
  });




}

// TODO: Tukaj implementirate funkcionalnosti, ki jo podpira vaša aplikacija

const ustvariToast = (text) => {
  $("#toast").html(`
  <div class="d-flex">
        <h6 style="color:white;" class="toast-body">${text}</h6>
        <button
          type="button"
          class="btn-close btn-close-white me-2 m-auto"
          data-bs-dismiss="toast"
          aria-label="Close"
        ></button>
      </div>`);
  $("#toast").show();
}

const izbrisiToast = () => {
  $("#toast").html("");
  $("#toast").hide();
}

const pridobiOstalePodatke = (scenarij, coinId, cb) => {
  danasnjaVrednostCoina(coinId, (res) => {
    scenarij.danes = res[0];
    zadnjaVrednostCoina(coinId, (res) => {
      scenarij.latest = res[0];
      pridobiEventeCoina(coinId, (res) => {
        scenarij.events = res.slice(-20);
        pridobiTwiteCoina(coinId, (res) => {
          scenarij.twits = res.slice(-20);
          posodobiPodatek(scenarij, coinId, cb);
        });
      });
    });
  });

  //return scenarij;
};

const predogledScenarija = (value) => {


  ustvariToast("Getting data, please wait a moment...");
  if (value) {
    pridobiPodatkeCoina(
      value,
      (data) => {
        danasnjaVrednostCoina(value, (res) => {
          data.danes = res[0];
          zadnjaVrednostCoina(value, (res) => {
            data.latest = res[0];
            pridobiEventeCoina(value, (res) => {
              data.events = res.slice(-20);
              pridobiTwiteCoina(value, (res) => {

                data.twits = res.slice(-20);
                let danes = data.danes.close;
                let vceraj = data.latest.close;
                let razlika = ((danes - vceraj) / danes) * 100;

                let ikona = razlika > 0 ? `<i class="fa-solid fa-caret-up"></i>` : `<i class="fa-solid fa-caret-down"></i>`
                let barva = razlika < 0 ? "#ea3943" : "#16c784";
                razlika = Math.abs(razlika)
                izbrisiToast();
                $("#prikaz-novega-scenarija").html(
                  `  <h3>Preview</h3>
                  <div class="coin-card" style="width: 15rem;">
                  <div id="id-section">
                  <span>ID:</span>
                  <span id="ident">${data.id}</span>
                </div>
    
            <div id="coin-card-up">
              <div id="coin-card-title">
                <h4 class="fw-bold">${data.symbol}</h4>
                <h6 class="card-subtitle mb-2 text-muted">${data.name}</h6>
               </div>
              <div id="coin-card-price">
                  <span class="price">${danes.toFixed(3)} <span class="val">USD</span></span>
                  <span class="diff" style="background-color: ${barva};">${ikona}  ${razlika.toFixed(2)} %</span>
              </div>
            </div>

            <div id="coin-card-mid"> 
            <div id="events"> 
              <h6 class="card-subtitle mb-2 text-muted"><i class="fa-regular fa-newspaper"></i> News: ${data.events.length}</h6>
              <h6 class="card-subtitle mb-2 text-muted"><i class="fa-brands fa-twitter"></i> Twits: ${data.twits.length}</h6>
            </div>
                <h4 class="card-subtitle mb-2 text-muted fw-bold"><span id="rank">RANK</span> ${data.rank}</h4>

            </div>
            <div id="coin-card-down">
              <button id=${data.id} onClick="ustvariNovScenarij(this.id)" type="button" class="btn btn-primary">Add</button>
              <a  id="info" target="_blank" href="https://www.tradingview.com/symbols/${data.symbol}" class="card-link"><i class="fa-solid fa-circle-info"></i></a> 
            </div>
             
          </div>
        </div>
        
      `
                );
              });
            });
          });
        });


      }
    );
  } else {
    izbrisiToast();
    $("#prikaz-novega-scenarija").html(`
      
    `);
  }
};

const ustvariNovScenarij = (coinId) => {
  $("#prikaz-novega-scenarija").html("");
  if (seznamDodanih.includes(coinId)) {
    $("#sporocilo-dodajanja").html(
      `<div class='alert alert-danger alert-dismissible fade show mt-3 mb-0'>
      ${coinId} already added to the list 
      <button type='button' class='btn-close' data-bs-dismiss='alert'></button>
      </div>
      `
    );

  } else {
    $("#sporocilo-dodajanja").html(
      `<div class='alert alert-success alert-dismissible fade show mt-3 mb-0'>
      ${coinId} succesfuly added 
      <button type='button' class='btn-close' data-bs-dismiss='alert'></button>
      </div>
      `
    );
    let scenarij = {};
    pridobiPodatkeCoina(
      coinId,
      ({
        description,
        id,
        name,
        open_source,
        org_structure,
        rank,
        started_at,
        symbol,
        type,
      }) => {
        scenarij.podatki = {
          description,
          id,
          name,
          open_source,
          org_structure,
          rank,
          started_at,
          symbol,
          type,
        };
        pridobiOstalePodatke(scenarij, coinId, (data) => {
          vrniPodatek("seznamDodanih", (data) => {
            seznamDodanih = data;
            seznamDodanih.unshift(coinId);
            console.log("awd", seznamDodanih);
            posodobiPodatek(seznamDodanih, "seznamDodanih", () => { });
            posodobiSeznamKart();
          });
        });
      }
    );
  }
};

const odstraniScenarij = (coinId) => {
  izbrisiVsePodatke(coinId, () => {
    vrniPodatek("seznamDodanih", (data) => {
      seznamDodanih = data;
      seznamDodanih.splice(seznamDodanih.indexOf(coinId), 1);
      posodobiPodatek(seznamDodanih, "seznamDodanih", () => { });
      posodobiSeznamKart();
    });
  })
};

const posodobiSeznamKart = () => {
  if (seznamDodanih.length > 0) {

    if (seznamDodanih.length <= 4) {
      $("#prikaz-kart").css("justify-content", "center");
      $("#prikaz-kart").html(``);
      $("#prikaz-kart-up").html(`
      <div id="prikaz-kart-up">
          <h1>List of all cryptos</h1>
        </div>`);
    }
    else {
      $("#prikaz-kart").css("justify-content", "flex-start");
      $("#prikaz-kart").html(``);
      $("#prikaz-kart-up").html(` 
        <div id = "prikaz-kart-up" >
        <h2 style="margin:0; padding:0;">List of all cryptos</h2>
        <i id="expand-button" onclick="povecajMenu()" class="fa-solid fa-maximize"></i>
        </div >`);
    }
  } else {
    $("#prikaz-kart").html(`
    <div class= "coin-card" style = "text-align:center; width:100%;" >
      <i class="fa-solid fa-plus"></i> Click button (generiranje podatkov) to generate data or chose it from left Test select section.
    </div>
    `);


  }


  for (let i = 0; i < seznamDodanih.length; i++) {
    vrniPodatek(seznamDodanih[i], (data) => {
      let danes = data.danes.close;
      let vceraj = data.latest.close;
      let razlika = ((danes - vceraj) / danes) * 100;
      let ikona = razlika > 0 ? `<i class="fa-solid fa-caret-up"></i>` : `<i class="fa-solid fa-caret-down"></i>`
      let barva = razlika < 0 ? "#ea3943" : "#16c784";
      razlika = Math.abs(razlika)

      $("#prikaz-kart").append(
        `<div class="coin-card" style="width: 15rem;">
        <div id="id-section"> 
          <span>ID:</span>
          <span id="ident">${data.podatki.id}</span>
        </div>

            <div id="coin-card-up">
              <div id="coin-card-title">
                <h4 class="fw-bold">${data.podatki.symbol}</h4>
                <h6 class="card-subtitle mb-2 text-muted">${data.podatki.name}</h6>
               </div>
              <div id="coin-card-price">
                  <span class="price">${danes.toFixed(3)} <span class="val">USD</span></span>
                  <span class="diff" style="background-color: ${barva};">${ikona}  ${razlika.toFixed(2)} %</span>
              </div>
            </div>
            <div id="coin-card-mid"> 
            <div id="events"> 
              <h6 class="card-subtitle mb-2 text-muted"><i class="fa-regular fa-newspaper"></i> News: ${data.events.length}</h6>
              <h6 class="card-subtitle mb-2 text-muted"><i class="fa-brands fa-twitter"></i> Twits: ${data.twits.length}</h6>
            </div>
                          <h4 class="card-subtitle mb-2 text-muted fw-bold"><span id="rank">RANK</span> ${data.podatki.rank}</h4>
            </div>
            <div id="coin-card-down">
               <a class="advanced" href="#" id=${data.podatki.id} onClick='prikazScenarija(this.id)' class="card-link">More <i class="fa-solid fa-circle-chevron-down"></i></a>
              <a class="remove" id=${data.podatki.id} onClick='odstraniScenarij(this.id)'  href="#" class="card-link">Remove           </a>
              <a  id="info" target="_blank" href="https://www.tradingview.com/symbols/${data.podatki.symbol}" class="card-link"><i class="fa-solid fa-circle-info"></i></a> 
            </div>
          </div>
        </div>`
      );
    });
  }
};

const povecajMenu = () => {
  let visina = $("#prikaz-kart").height();
  if (visina < 250)
    $("#prikaz-kart").css("max-height", "none");
  else
    $("#prikaz-kart").css("max-height", "220px");
}

const prikazScenarija = (coinId) => {
  if (coinId == 0) {
    $("#prikaz-podatkov-scenarija").html(``);
    $("#prikaz-scenarija-down").css("border", "1px solid rgb(218, 218, 218)")
  }
  else {
    $("#prikaz-scenarija-down").css("border", "none")
    if (seznamDodanih.includes(coinId)) {
      vrniPodatek(coinId, (data) => {
        let danes = data.danes.close;
        let vceraj = data.latest.close;
        let razlika = ((danes - vceraj) / danes) * 100;

        let ikona = razlika > 0 ? `<i class="fa-solid fa-caret-up"></i>` : `<i class="fa-solid fa-caret-down"></i>`
        let barva = razlika < 0 ? "#ea3943" : "#16c784";

        let opis = "";
        if (data.podatki.description.length > 50)
          opis = data.podatki.description.substring(0, 50) + ' ...';
        else
          opis = data.podatki.description;;

        razlika = Math.abs(razlika)
        $("#prikaz-scenarija-up").html(
          ` <div id ="prikaz-podatkov-scenarija"> 
         
          <div id="prikaz-up">
            <div id="prikaz-heading">
              <h1>${data.podatki.name}</h1>
              <h5>(${data.podatki.symbol})</h5>
              <p>Rank ${data.podatki.rank}</p>
            </div>
            <div id="coin-card-price">
                  <span class="price">${danes.toFixed(3)} <span class="val">USD</span></span>
                  <span class="diff" style="background-color: ${barva};">${ikona}  ${razlika.toFixed(2)} %</span>
                  <a class="btn btn-primary " style="margin-top:5px;"  data-bs-toggle="collapse" href="#priceCollapse" role="button" aria-expanded="false" aria-controls="priceCollapse">
                  See more
                </a>
                <div class="collapse" id="priceCollapse" style="margin-top:5px;">
              <div id="price-data-collapse">
                <div id="danes"> 
                  <h6>Today</h6>
                  <p><span id='atr'>Open</span>  ${data.danes.open.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>High</span>  ${data.danes.high.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>Low</span>  ${data.danes.low.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>Close</span>  ${data.danes.close.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>Volume</span>  ${data.danes.volume} <span class="val">USD</span></p>
                  <p><span id='atr'>Market cap.</span>  ${data.danes.market_cap} <span class="val">USD</span></p>
                </div>
                <div id="latest">
                  <h6>Yesterday</h6>
                  <p><span id='atr'>Open</span>  ${data.latest.open.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>High</span>  ${data.latest.high.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>Low</span>  ${data.latest.low.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>Close</span>  ${data.latest.close.toFixed(3)} <span class="val">USD</span></p>
                  <p><span id='atr'>Volume</span>  ${data.latest.volume} <span class="val">USD</span></p>
                  <p><span id='atr'>Market cap.</span>  ${data.latest.market_cap} <span class="val">USD</span></p>
                </div>


              </div>
            </div>
            </div>
          </div>
          <div id="prikaz-data">
            <p><i class="fa-solid fa-calendar"></i><span> Started at </span> ${new Date(data.podatki.started_at).toLocaleString()}</p>
            <p><i class="fa-solid fa-coins"></i> <span>Type </span> ${data.podatki.type}</p>
            <p><i class="fa-solid fa-user-gear"></i> <span>Open source </span> ${data.podatki.open_source}</p>
            <p><i class="fa-solid fa-circle-nodes"></i> <span>Org structure </span> ${data.podatki.org_structure}</p>
              
            <div id="desc"><p>${opis} <a  class="link-primary"  data-bs-toggle="modal" data-bs-target="#exampleModal" style="font-weight:500">
              Full text
            </a></p> </div>



            <!-- Modal -->
            <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Description</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    ${data.podatki.description}
                  </div>
                </div>
              </div>
            </div>
            
            
          </div>
            
          </div>
          <div id="graf-scenarija">
          <div id = "graf-content" style = "height:auto;width:80%;"></div>
          </div>
          `
        );

        var dps1 = [],
          dps2 = [],
          dps3 = [];
        var stockChart = new CanvasJS.StockChart("graf-content", {
          theme: "light2",
          exportEnabled: true,
          borderRadius: 15,
          title: {
            text: data.podatki.name,
          },
          subtitles: [
            {
              text: data.podatki.name + " Price (in USD)",
            },
          ],
          charts: [
            {
              toolTip: {
                shared: true,
              },
              axisX: {
                lineThickness: 5,
                tickLength: 0,
                labelFormatter: function (e) {
                  return "";
                },
              },
              axisY: {
                prefix: "$",
              },
              legend: {
                verticalAlign: "top",
              },

              data: [
                {
                  type: "candlestick",
                  yValueFormatString: "$#,###.###",
                  dataPoints: dps1,
                },
              ],
            },

          ],
          navigator: {
            data: [
              {
                dataPoints: dps2,
              },
            ],
            slider: {
              minimum: new Date(2020, 01, 01),
              maximum: new Date(2021, 01, 01),
            },
          },
        });
        zgodovinaVrednostiCoina(
          data.podatki.id,
          "2022-06-01",
          "2023-06-06",
          (vrednosti) => {
            for (var i = 0; i < vrednosti.length; i++) {
              dps1.push({
                x: new Date(vrednosti[i].time_open),
                y: [
                  Number(vrednosti[i].open),
                  Number(vrednosti[i].high),
                  Number(vrednosti[i].low),
                  Number(vrednosti[i].close),
                ],
              });
              dps2.push({
                x: new Date(vrednosti[i].time_open),
                y: Number(vrednosti[i].close),
              });
              dps3.push({
                x: new Date(vrednosti[i].time_open),
                y: Number(vrednosti[i].volume),
              });
            }
            stockChart.render();
          }
        );

        if (data.events.length <= 0) {
          $("#prikaz-dogodkov").html(`<h3>News(${data.events.length})<h3>`)
        } else {
          let name;
          let slika;
          let ikona;
          $("#prikaz-dogodkov").html(`<h3>News(${data.events.length})<h3>`);
          for (let i = 0; i < data.events.length; i++) {
            if (data.events[i].name.length > 60)
              name = data.events[i].name.substring(0, 60) + "...";
            else
              name = data.events[i].name;

            if (data.events[i].proof_image_link) {
              slika = `background: url('${data.events[i].proof_image_link}')`;
              ikona = "";
            }

            else {
              slika = 'display:flex; align-items:center; justify-content:center';
              ikona = '<i class="fa-solid fa-image"></i>'
            }


            $("#prikaz-dogodkov").append(
              `
             <div class="dogodek">
             <div id="dogodek-slika" style="${slika};background-position:center; background-repeat: no-repeat; background-size: cover">
              ${ikona}
             </div>

             <div id="dogodek-content">
               <h6 class="card-title">${name}</h6>
              <h6 class="card-subtitle mb-2 text-muted"><i class="fa-solid fa-calendar"></i> ${new Date(data.events[i].date).toLocaleString()}</h6>
            <a
            id="news-link"
            target ="_blank"
          href="${data.events[i].link}"
             </div>
            
          Read more</a
          >
            
          </div>
          `
            );
          }
        }

        if (data.twits.length <= 0) {
          $("#prikaz-twitov").html(`<h3>Twits(${data.twits.length})<h3>`);
        } else {
          let name;
          let slika;
          let ikona;

          $("#prikaz-twitov").html(`<h3>Twits(${data.twits.length})<h3>`);
          for (let i = 0; i < data.twits.length; i++) {
            if (data.twits[i].status.length > 90)
              name = data.twits[i].status.substring(0, 90) + "...";
            else
              name = data.twits[i].status;

            if (data.twits[i].user_image_link) {
              slika = `background: url('${data.twits[i].user_image_link}')`;
              ikona = "";
            }
            else {
              slika = 'display:flex; align-items:center; justify-content:center';
              ikona = '<i class="fa-solid fa-user"></i>'
            }


            $("#prikaz-twitov").append(
              `
              <div class="twit">
                <div id="profile-content">
                  <div id="profile-img"  style=" ${slika};background-position:center; background-repeat: no-repeat; background-size:auto">
                  </div>
                  <h5> ${data.twits[i].user_name}</h5>
                </div>
                <div id="twit-content">



                  <h6 class="card-title">${name}</h6>
                  <h6 class="card-subtitle mb-2 text-muted"><i class="fa-solid fa-calendar"></i> ${new Date(data.twits[i].date).toLocaleString()}</h6>
                  <a target ="_blank" id="news-link" href="${data.twits[i].status_link}" </div>
                    See original</a>

                  <span id="likes"><i class="fa-solid fa-heart"></i> ${data.twits[i].like_count}</span>
                  <span id="retwets"> <i class="fa-solid fa-retweet"></i> ${data.twits[i].retweet_count}</span>
                 

                </div>
            `
            );
          }
        }
      });
    }
    else {
      if (coinId == "btc-bitcoin")
        generirajScenarij(1, () => {
          vrniPodatek("seznamDodanih", (data) => {
            seznamDodanih = data;
            seznamDodanih.unshift(coinId);
            posodobiPodatek(seznamDodanih, "seznamDodanih", () => { });
            posodobiSeznamKart();
          });
        });
      else if (coinId == "eth-ethereum") {
        generirajScenarij(2, () => {
          vrniPodatek("seznamDodanih", (data) => {
            seznamDodanih = data;
            seznamDodanih.unshift(coinId);
            posodobiPodatek(seznamDodanih, "seznamDodanih", () => { });
            posodobiSeznamKart();
          });
        });
      } else if ((coinId == "usdt-tether")) {
        generirajScenarij(3, () => {
          vrniPodatek("seznamDodanih", (data) => {
            seznamDodanih = data;
            seznamDodanih.unshift(coinId)
            posodobiPodatek(seznamDodanih, "seznamDodanih", () => { });
            posodobiSeznamKart();
          });
        });
      }
    }
  }
};

function poslusalciModalnaOkna() {
  const modalnoOknoPrijava = new bootstrap.Modal(document.getElementById('modalno-okno-prijava'), {
    backdrop: 'static'
  });
  const modalnoOknoDoniraj = new bootstrap.Modal(document.getElementById('modalno-okno-donacije'), {
    backdrop: 'static'
  });

  $("#denarnica,#geslo").keyup(function (e) {
    if ($("#denarnica").val().length > 0 && $("#geslo").val().length > 0)
      $("#gumb-potrdi-prijavo").removeAttr("disabled");
    else
      $("#gumb-potrdi-prijavo").attr("disabled", "disabled");
  });

  $("#gumb-potrdi-prijavo").click(function (e) {
    prijavaEthereumDenarnice(modalnoOknoPrijava);
  });

  $("#potrdi-donacijo").click(function (e) {
    donirajEthereum(modalnoOknoDoniraj);
  });

  var modalnoOknoDonacije = document.getElementById('modalno-okno-donacije');
  modalnoOknoDonacije.addEventListener('show.bs.modal', function (event) {
    var prijavljenaDenarnica = $("#eth-racun").attr("denarnica");
    $("#posiljatelj").text(prijavljenaDenarnica);
    $("#prejemnik").text(SENSEI_RACUN);
  });

  var modalnoOknoSeznamDonacij = document.getElementById('modalno-okno-seznam-donacij');
  modalnoOknoSeznamDonacij.addEventListener('show.bs.modal', function (event) {
    dopolniTabeloDonacij();
  });
}

function okrajsajNaslov(vrednost) {
  return vrednost.substring(0, 3) + "..." + vrednost.substring(vrednost.length - 3, vrednost.length);
}

const prijavaEthereumDenarnice = async (modalnoOknoPrijava) => {
  try {
    let rezultat = await web3.eth.personal.unlockAccount(
      $("#denarnica").val(),
      $("#geslo").val(),
      300);

    // ob uspešni prijavi računa
    if (rezultat) {
      prijavljenRacun = $("#denarnica").val();
      $("#eth-racun").html("User: " + okrajsajNaslov($("#denarnica").val()));
      $("#eth-racun").attr("denarnica", $("#denarnica").val());
      $("#gumb-doniraj-start").removeAttr("disabled");
      modalnoOknoPrijava.hide();
    } else {
      // neuspešna prijava računa
      $("#napakaPrijava").html(
        "<div class='alert alert-danger' role='alert'>" +
        "<i class='fas fa-exclamation-triangle me-2'></i>" +
        "Prišlo je do napake pri odklepanju!" +
        "</div>"
      );
    }
  } catch (napaka) {
    // napaka pri prijavi računa
    $("#napakaPrijava").html(
      "<div class='alert alert-danger' role='alert'>" +
      "<i class='fas fa-exclamation-triangle me-2'></i>" +
      "Prišlo je do napake pri odklepanju: " + napaka +
      "</div>"
    );

  }
};

const donirajEthereum = async (modalnoOknoDoniraj) => {
  var sredstva = $("#donacija").val() / 10;


  try {
    var posiljateljDenarnica = $("#eth-racun").attr("denarnica");

    let rezultat = await web3.eth.sendTransaction({
      from: posiljateljDenarnica,
      to: SENSEI_RACUN,
      value: sredstva * Math.pow(10, 18),
    });

    let donacija = {
      from: okrajsajNaslov(posiljateljDenarnica),
      to: okrajsajNaslov(SENSEI_RACUN),
      value: sredstva,
      when: new Date().toLocaleString()
    }
    // ob uspešni prijavi računa
    if (rezultat) {
      modalnoOknoDoniraj.hide();
      vrniPodatek("donacije", (data) => {
        console.log("TO SO NOVE DONACIJE, ", data)
        data.push(donacija);
        console.log("TO SO NOVE DONACIJE, ", data)
        posodobiPodatek(data, "donacije", () => { });
      }
      )

    } else {
      // neuspešna prijava računa
      $("#napakaDonacija").html(
        "<div class='alert alert-danger' role='alert'>" +
        "<i class='fas fa-exclamation-triangle me-2'></i>" +
        "Prišlo je do napake pri transakciji!" +
        "</div>"
      );
    }
  } catch (e) {
    // napaka pri prijavi računa
    $("#napakaDonacija").html(
      "<div class='alert alert-danger' role='alert'>" +
      "<i class='fas fa-exclamation-triangle me-2'></i>" +
      "Prišlo je do napake pri transakciji: " + e +
      "</div>"
    );
  }

};

const posodobiKolicino = (value) => {
  $("#doniraj-amount").html(`Amout of Ethereum <i class="fa-brands fa-ethereum"></i>${value / 10}`);
}

$(document).ready(function () {

  poslusalciModalnaOkna();
  vrniPodatek("seznamDodanih", (data) => {
    seznamDodanih = data;
    posodobiCoine();
    vrniPodatek("seznam", (data) => {
      $("#datalistOptions").html("");
      for (let i = 0; i < data.length; i++) {
        $("#datalistOptions").append(
          "<option  " + "value='" + data[i].id + "' >" + data[i].symbol + "</option >"
        );
      }
    })
    posodobiSeznamKart();
  });
});

const dopolniTabeloDonacij = async () => {
  let st = 1;
  vrniPodatek("donacije", (data) => {
    for (let i = 0; i < data.length; i++) {
      $("#seznam-donacij").append("\
                    <tr>\
                        <th scope='row'>" + st++ + "</th>\
                        <td>" + data[i].from + "</td>\
                        <td>" + data[i].to + "</td>\
                        <td>" + data[i].when + "</td>\
                        <td>" + data[i].value + " <i class='fa-brands fa-ethereum'></i></td>\
                    </tr>");
    }
  })

};

const rocniVpis = () => {
  let inputVal = $("#scenarijInput").val();

  if (seznamDodanih.includes(inputVal)) {
    console.log("to je input val", inputVal)
    prikazScenarija(inputVal);
    $("#success-search").html(`<div class='alert alert-success alert-dismissible fade show mt-3 mb-0'>
      ${inputVal} is correct.
      <button type='button' class='btn-close' data-bs-dismiss='alert'></button>
      </div>
      `)
  } else {
    $("#success-search").html(`<div class='alert alert-danger' role='alert'>
      <i class='fas fa-exclamation-triangle me-2'></i> Wrong id
      </div>`)
  }
}

const posodobiCoine = () => {
  for (let i = 0; i < seznamDodanih.length; i++) {
    danasnjaVrednostCoina(seznamDodanih[i], (danes) => {
      vrniPodatek(seznamDodanih[i], (data) => {
        data.danes = danes[0];
        posodobiPodatek(data, seznamDodanih[i], () => { });
      })

    })
  }
}


const vrniVsePodatke = (cb) => {
  $.ajax({
    url: TEACHING_API_BASE_URL + "vrni/vsi",
    type: "GET",
    success: function (res) {
      console.log(res);
    },
  });
};

const posodobiPodatek = (podatki, podatekId, cb) => {
  $.ajax({
    url: `${TEACHING_API_BASE_URL}azuriraj?kljuc=${podatekId}`,
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(podatki),
    success: () => cb(podatki),
    error: function (err) {
      console.log(err);
    }
  });
};

const vrniPodatek = (podatekId, cb) => {
  $.ajax({
    url: `${TEACHING_API_BASE_URL}vrni/${podatekId}`,
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const izbrisiVsePodatke = (podatekId, cb) => {

  $.ajax({
    url: `${TEACHING_API_BASE_URL}brisi?kljuc=${podatekId}`,
    type: "DELETE",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const pridobiPodatkeCoina = (coinId, cb) => {
  $.ajax({
    url: `${COINPAPRIKA_API_BASE_URL}coins/${coinId}`,
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const danasnjaVrednostCoina = (coinId, cb) => {
  $.ajax({
    url: `${COINPAPRIKA_API_BASE_URL}coins/${coinId}/ohlcv/today`,
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const zadnjaVrednostCoina = (coinId, cb) => {
  $.ajax({
    url: `${COINPAPRIKA_API_BASE_URL}coins/${coinId}/ohlcv/latest`, //2019-01-01
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const zgodovinaVrednostiCoina = (coinId, zacetek, konec, cb) => {
  $.ajax({
    url: `${COINPAPRIKA_API_BASE_URL}coins/${coinId}/ohlcv/historical?start=${zacetek}&end=${konec}`,
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const pridobiTwiteCoina = (coinId, cb) => {
  $.ajax({
    url: `${COINPAPRIKA_API_BASE_URL}coins/${coinId}/twitter`,
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const pridobiEventeCoina = (coinId, cb) => {
  $.ajax({
    url: `${COINPAPRIKA_API_BASE_URL}coins/${coinId}/events`,
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};

const pridobiSeznamCoinov = (cb) => {
  $.ajax({
    url: `${COINPAPRIKA_API_BASE_URL}coins`,
    type: "GET",
    success: cb,
    error: function (err) {
      console.log(err);
    }
  });
};
