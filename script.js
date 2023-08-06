const fileSelector = document.getElementById('file-selector')

var filedata = ""
var selectedFile = {}

fileSelector.addEventListener('change', (event) => {
    selectedFile = event.target.files[0]
    const reader = new FileReader()

    reader.addEventListener('load', (event) => {
        filedata = event.target.result

        console.log(`Provided file's data`, selectedFile)
        console.log(`Loaded ${selectedFile.length / 1024 / 1024}mb of pgn data`)
    })

    reader.readAsText(selectedFile)
});

var draw = () => {
    var rate = []
    var dr = []

    var temp = selectedFile.name.split("lichess_")[1].split("_")

    var nickname = ""

    var variant = document.getElementById("variant").value

    for (let i = 0; i < temp.length - 1; i++) {
        nickname += temp[i]

        if (i !== temp.length - 2) nickname += "_"
    }

    console.log(nickname)

    data = filedata.split("\n")

    var playingForWhite = true
    var saving = true

    for (var i in data) {
        if (data[i].includes("Event")) {
            saving = data[i].includes(variant) && (data[i].includes("Rated") || data[i].includes("Arena"))
        }

        if (data[i].includes(nickname)) {
            playingForWhite = (data[i].split(" ")[0] === "[White")
            continue;
        }

        if (data[i].includes("WhiteElo") && playingForWhite && saving) {
            rate.push(Number(data[i].split('"')[1]))

            continue;
        }

        if (data[i].includes("BlackElo") && !playingForWhite && saving) {
            rate.push(Number(data[i].split('"')[1]))

            continue;
        }

        if (data[i].includes("WhiteRatingDiff") && playingForWhite && saving) {
            rate[rate.length - 1] += Number(data[i].split('"')[1])
            dr.push(Number(data[i].split('"')[1]))

            continue;
        }

        if (data[i].includes("BlackRatingDiff") && !playingForWhite && saving) {
            rate[rate.length - 1] += Number(data[i].split('"')[1])
            dr.push(Number(data[i].split('"')[1]))

            continue;
        }
    }

    console.log(`Found ${rate.length} games`)

    var numbers = []

    for (let i in rate) {
        numbers.push(Number(i) + 1)
    }

    rate = rate.reverse()
    
    document.getElementById("canvas-div").innerHTML = `<canvas id="canvas"></canvas>`

    var canvas = document.getElementById("canvas")

    const plugin = {
        id: 'customCanvasBackgroundColor',
        beforeDraw: (chart, args, options) => {
            const {
                ctx
            } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = options.color || '#ffffff';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };

    var chart = new Chart(canvas, {
        type: 'line',
        data: {
            labels: numbers,
            datasets: [
                {
                    label: `${nickname}'s rating (${variant})`,
                    data: rate,
                    backgroundColor: "rgba(0,0,255,1.0)",
                    borderColor: "rgba(0,0,255,0.1)",
                    fill: false,
                    pointRadius: 2,
                    }
                ]
        },
        options: {
            plugins: {
                customCanvasBackgroundColor: {
                    color: '#afafaf',
                }
            },
            animation: false,
            spanGaps: true
        },
        plugins: [plugin],
    });
}
