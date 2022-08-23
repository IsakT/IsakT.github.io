var inputValues = {
    hours: {
        _value: 168,
        set value(val) {
            this._value = parseFloat(val);
        },
        get value() {
            return this._value;
        },
        min: 1,
        max: 200,
        step: 1,
        reset: function () {
            this._value = 168;
        }
    },
    billed_hourly: {
        _value: 820,
        set value(val) {
            this._value = parseFloat(val);
        },
        get value() {
            return this._value;
        },
        min: 500,
        step: 1,
        max: 2000,
        reset: function () {
            this._value = 820;
        }
    },
    vacation_rate: {
        min: 12,
        max: 112,
        step: 1,
        _value: 12,
        get value() {
            return parseFloat(this._value);
        },
        set value(val) {
            this._value = val;
        },
        reset: function () {
            this._value = 12;
        }
    }
};

var legendData = {
    get total_cost() {
        return inputValues.hours.value * inputValues.billed_hourly.value;
    },
    get wage_pot() {
        return this.total_cost * 0.7;
    },
    get salary(){
        const lowest_vacation_monthly = this.max_salary * 0.12;

        if(lowest_vacation_monthly == this.vacation_monthly){
            return this.max_salary
        } else {
            return this.max_salary - (this.vacation_monthly - lowest_vacation_monthly)
        }
    },
    get max_salary(){
        // max_salary including 12% vacation rate
        const max_salary = this.wage_pot * 0.697252824;
        return max_salary
    },
    get vacation_monthly() {
        return this.max_salary * (inputValues.vacation_rate.value / 100);
    }
};

var chartData = [
    {
        label: 'Din lön',
        id: 'salary',
        color: '#DBEFAF',
        get value() {
            return legendData.salary;
        }
    },
    {
        label: 'Semestersparande',
        id: 'vacation_monthly',
        color: '#88D2E0',
        get value() {
            return legendData.vacation_monthly;
        }
    },
    {
        label: 'Bruttokonto',
        id: 'wage_pot',
        color: 'gray',
        get value() {
            return legendData.wage_pot - legendData.salary - legendData.vacation_monthly;
        }
    },
];

draw();

function draw() {
    var paddingTop = 30;

    var tooltip = d3.select('.chart-box')
        .append('div')
        .attr('class', 'tooltip');

    tooltip.append('div')
        .attr('class', 'color-icon');

    tooltip.append('div')
        .attr('class', 'label');

    var chart = document.querySelector('.chart');
    chart.innerHTML = "";

    var width = chart.offsetWidth;
    var height = chart.offsetWidth + 2;

    var radius = width / 2;

    var color = d3.scaleOrdinal()
        .domain(chartData.map(function (d) {
            return d.label;
        }))
        .range(function (d) {
            return d.color;
        });

    var svg = d3.select('.chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', 'translate(' + (width / 2) +
            ',' + (height / 2) + ')');

    var donutWidth = width > 250 ? 30 : 20;
    var innerRadius = radius - donutWidth;
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

    var pie = d3.pie()
        .padAngle(.007)
        .value(function (d) {
            return d.value;
        })
        .sort(null);

    var path = svg.selectAll('path')
        .data(pie(chartData))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', function (d) {
            return d.data.color;
        });

    path.on('mouseover', function (d) {
        // var x = arc.centroid(d)[0];
        // var y = arc.centroid(d)[1];

        var x = d.clientX
        var y = d.clientY
        var r = innerRadius + donutWidth / 2;
        var cos = x / r;
        var sin = y / r;

        // var top = height / 2 + y + paddingTop;
        // var left = width / 2 + x;

        var top = y / 3
        var left = x / 2

        console.log("d: ", d)
        console.log("scrElement: ", d.srcElement.__data__.data.label)

        const data = d.srcElement.__data__.data;
        tooltip.select('.label').text(data.label);
        tooltip
            .style('top', top + 'px')
            .style('left', left + 'px')
            .style('display', 'flex');

        tooltip.select('.color-icon')
            .style('background-color', data.color);

        // if (cos > 0.5) {
        //     tooltip.attr('class', 'tooltip west');
        // } else if (cos < -0.5) {
        //     tooltip.attr('class', 'tooltip east');
        // } else if (sin > 0.86) {
        //     tooltip.attr('class', 'tooltip south');
        // } else {
        //     tooltip.attr('class', 'tooltip north');
        // }
    });

    path.on('mouseout', function () {
        tooltip.style('display', 'none');
    });

    var estimateText = d3.select('.chart')
        .append('div')
        .attr('class', 'estimate');

    estimateText
        .append('div')
        .attr('class', 'estimate__heading')
        .append('text')
        .html('Maximalt löneuttag');

    estimateText
        .append('div')
        .attr('class', 'estimate__value')
        .text(Math.round(legendData.max_salary));

    // controllers
    document.querySelectorAll('.controller-row')
        .forEach(function (group) {
            var min = inputValues[group.id].min;
            var max = inputValues[group.id].max;
            var value = inputValues[group.id].value;
            var step = inputValues[group.id].step;

            var boundary = max ? 100 * (value - min) / (max - min) : 0;

            var range = group.querySelector('input[type=range]');

            range.setAttribute('style',
                'background-image: linear-gradient(90deg, #4098FF 0%, #4098FF ' + boundary + '%, white ' + boundary + '%);'
            );
            range.min = min;
            range.max = max;
            range.value = value;
            range.step = step;

            var textInput = group.querySelector('input[type=number]');
            textInput.min = min;
            textInput.max = max;
            textInput.value = value;
            textInput.step = step;
        });

    // legends
    document.querySelectorAll('.chart__description-value')
        .forEach(function (valueWrapper) {
            var value = legendData[valueWrapper.classList[1]];
            valueWrapper.textContent = Math.round(value);
        })
}

document.querySelectorAll('.info')
    .forEach(function (element) {
       element.addEventListener('mouseover', function (e) {
           if(e.screenY > window.innerHeight / 2 + 100) {
               element.querySelector('.info__tooltip').classList.add('north');
           } else {
               element.querySelector('.info__tooltip').classList.remove('north');
           }
       });
    });

document.querySelectorAll('.controller-row')
    .forEach(function (group) {
        var range = group.querySelector('input[type=range]');
        var textInput = group.querySelector('input[type=number]');
        var id = group.id;

        range.addEventListener('input', function (e) {
            inputValues[id].value = e.target.value;
            draw();
        });
        textInput.addEventListener('change', function (e) {
            inputValues[id].value = e.target.value;
            draw();
        });
    });

document.querySelector('.btn__reset')
    .addEventListener('click', function () {
       Object.values(inputValues).map(function (value) {
           value.reset();
       });
       draw();
    });

document.querySelectorAll('.btn__toggle-modal')
    .forEach(function (btn) {
        btn.addEventListener('click', function () {
            var dialog = document.querySelector('.dialog');
            dialog.classList.toggle('open');
        });
    });

d3.select(window)
    .on('resize', draw);


