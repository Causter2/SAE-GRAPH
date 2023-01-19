main()


setTimeout(function() {
  document.querySelector("nav").classList.remove("hidden");
  document.querySelector("nav").classList.add("show");
}, 1000);


async function main() {
  let data = await fetchData()
  const nombreFeu = compteFeuAnnee(data)

  const graph1 = echarts.init(document.getElementById('graph1'));
  window.addEventListener('resize', graph1.resize);

  const graph1_option = {
    tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis: [
        {
        type: 'category',
        data: Object.keys(nombreFeu),
        axisTick: {
            alignWithLabel: true
        }
        }
    ],
    yAxis: [
        {
        type: 'value'
        }
    ],
    series:
    [
      {
        name: 'Direct',
        type: 'bar',
        barWidth: '60%',
        data: Object.values(nombreFeu)
      }
    ]
  };
  graph1.setOption(graph1_option)

  const tierListCommune = compteFeuCommune(data)
  console.log(tierListCommune)

  const graph3 = echarts.init(document.getElementById('graph3'));
  const graph3_option = {
    title: {
      text: 'Basic Radar Chart'
    },
    legend: {
      data: ['Nombre de feu', 'Surface du feu']
    },
    radar: {
      // shape: 'circle',
      indicator: Object.keys(tierListCommune).map((commune, idx) => {
        console.log(commune, idx)
        console.log(Math.round(((Object.values(tierListCommune)[idx].surfaceFeu / 10000))))
        return {
          name: commune,
          max: Math.round(((Object.values(tierListCommune)[idx].surfaceFeu / 10000) + 1000))
        }
      })
    },
    series: [
      {
        name: 'Budget vs spending',
        type: 'radar',
        data: [
          {
            value: Object.values(tierListCommune).map((commune) => commune.nombreFeu * 2),
            name: 'Nombre de feu'
          },
          {
            value: Object.values(tierListCommune).map((commune) => commune.surfaceFeu / 10000),
            name: 'Surface du feu'
          }
        ]
      }
    ]
  };
  graph3.setOption(graph3_option);

}

function compteFeuAnnee(data) {
  return data.reduce((acc, curr) => {
    const annee = curr["annee"]
    if (!acc[annee]) {
      acc[annee] = 0
    }
    acc[annee] += 1
    return acc
  }, {})
}

async function fetchData() {
  const req = await fetch("./incendies_1992-2022.json")
  const data = await req.json()
  return data
}

function compteFeuCommune(data) {
  const nombreFeuCommune = data.reduce((acc, feu) => {
    const commune = feu["commune"]
    if (!acc[commune]) {
      acc[commune] = {}
    }
    acc[commune].nombreFeu = acc[commune].nombreFeu ? acc[commune].nombreFeu + 1 : 1
    acc[commune].surfaceFeu = acc[commune].surfaceFeu ? acc[commune].surfaceFeu + parseInt(feu["surface"]) : parseInt(feu["surface"])
    return acc
  }, {})
  // get first 10 commune with most fire
  const topCommune = Object.keys(nombreFeuCommune).sort((a, b) => nombreFeuCommune[b].nombreFeu - nombreFeuCommune[a].nombreFeu).slice(0, 10).reduce((acc, commune) => {
    acc[commune] = nombreFeuCommune[commune]
    return acc
  }, {})
  return topCommune
}