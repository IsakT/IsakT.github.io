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
    monthly_salary: {
        _value: 45000,
        set value(val) {
            this._value = parseFloat(val);
        },
        get value() {
            return this._value;
        },
        min: 0,
        step: 1,
        _max: 100000,
        set max(val) {
            this._max = val;
        },
        get max() {
            return this._max;
        },
        reset: function () {
            this._value = 45000;
        }
    },
    bonus: {
        _value: 0,
        set value(val) {
            this._value = val;
        },
        get value() {
            return this._value;
        },
        min: 0,
        step: 1,
        max: 100000,
        reset: function () {
            this._value = 0;
        }
    },
    pension: {
        _value: 0,
        set value(val) {
            this._value = val;
        },
        get value() {
            return this._value;
        },
        min: 0,
        step: 1,
        max: 20000,
        reset: function () {
            this._value = 0;
        }
    },
    expenses: {
        _value: 0,
        set value(val) {
            this._value = val;
        },
        get value() {
            return this._value;
        },
        min: 0,
        step: 1,
        max: 100000,
        reset: function () {
            this._value = 0;
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
    vacation_days: {
        min: 25,
        max: 200,
        step: 1,
        _value: 25,
        get value() {
            return this._value;
        },
        set value(val) {
            this._value = val;
        },
        reset: function () {
            this._value = 25;
        }
    }
};

var legendData = {
  get vacation_monthly() {
    return vacation_save_per_month();
  },
  get monthly_salary() {
    return parseInt(inputValues.monthly_salary.value) + parseInt(inputValues.bonus.value);
  },
  get billed_hourly() {
    return inputValues.billed_hourly.value;
  },
  get wage_pot() {
    return this.total_cost * 0.7;
  },
  get wage_pot_remaining() {
    const salary = this.monthly_salary;
    const social_tax = 1 + 0.3142;
    const expenses = inputValues.expenses.value;
    const pension = inputValues.pension.value * 1.22;

    const remaining = this.wage_pot - (salary * social_tax) - this.vacation_monthly - expenses - pension;

    return Math.floor(remaining)
  },
  get total_cost() {
    return inputValues.hours.value * inputValues.billed_hourly.value;
  },
  get hourly_wage() {
    const social_tax = 1 - 0.3142;
    const vacation = 1 - 0.12;
    const hourly = ((this.wage_pot * social_tax * vacation) + parseInt(inputValues.bonus.value)) / inputValues.hours.value;
    return hourly;
  },
  get max_salary(){
    const magic_number = 0.6857267297 // don't ask, just accept it
    const max_salary = this.wage_pot * magic_number;
    inputValues.monthly_salary.max = max_salary;
    return max_salary
  },
  get social_tax_monthly(){
    const pension_taxes = inputValues.pension.value * 0.22;
    const income_taxes = this.monthly_salary * 0.3142;
    return income_taxes + pension_taxes;
  }

};

var chartData = [
  {
      label: 'DIN LÖN',
      id: 'monthly-salary',
      color: '#bee26f',
      get value() {
          return legendData.monthly_salary;
      }
  },
  {
    label: 'BONUS',
    id: 'bonus',
    color: '#DBEFAF',
    get value() {
        return Math.floor(inputValues.bonus.value);
    }
  },
  {
    label: 'PENSION',
    id: 'pension',
    color: '#ffc04d',
    get value() {
        return Math.floor(inputValues.pension.value);
    }
  },
  {
    label: 'SOCIALA AVGIFTER',
    id: 'social-tax',
    color: 'red',
    get value() {
        return Math.floor(legendData.social_tax_monthly);
    }
  },
  {
    label: 'FASTA UTGIFTER',
    id: 'expenses',
    color: '#cc0000',
    get value() {
        return inputValues.expenses.value;
    }
  },
  {
    label: 'SEMESTER',
    id: 'vacation',
    color: '#88D2E0',
    get value() {
        console.log();
        return legendData.vacation_monthly;
    }
   },
  {
    label: 'BRUTTOKONTOT',
    id: 'wage_pot_remaining',
    color: 'rgb(58, 58, 174)',
    get value() {
      return legendData.wage_pot_remaining;
    }
   },
   {
    label: 'TOTALT FAKTURERAT',
    id: 'total_cost',
    color: 'gray',
    get value() {
      return (
        legendData.total_cost - 
        Math.abs(legendData.wage_pot_remaining) - 
        legendData.vacation_monthly - 
        legendData.monthly_salary - 
        legendData.social_tax_monthly -
        inputValues.expenses.value -
        // inputValues.bonus.value -
        inputValues.pension.value
        );
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

        var top = y / 5
        var left = x / 5

        console.log("d: ", d)
        console.log("scrElement: ", d.srcElement.__data__.data.label)

        const data = d.srcElement.__data__.data;
        tooltip.select('.label').text(data.label);
        tooltip
            .style('top', top + 'px')
            .style('left', left + 'px')
            .style('display', 'flex');

        // tooltip.select('.color-icon')
        //     .style('background-color', data.color);

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
        .html('Motsvarande<br>timlön<br>utanför Castra');

    estimateText
        .append('div')
        .attr('class', 'estimate__value')
        .text(Math.round(legendData.hourly_wage));

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

function vacation_save_per_month(){
    const salary = parseInt(inputValues.monthly_salary.value);
    const salary_social_tax = salary * 0.3142;
    const pension = parseInt(inputValues.pension.value);
    const pension_social_tax = pension * 0.22;
    const misc_expenses = parseInt(inputValues.expenses.value);
    const vacation_days_per_year = parseInt(inputValues.vacation_days.value);
    const working_days_in_year = 253 - vacation_days_per_year;

    const expenditure_per_month = salary + salary_social_tax + pension + pension_social_tax + misc_expenses;

    const save_per_working_day = expenditure_per_month / working_days_in_year;

    const to_save_each_month = save_per_working_day * vacation_days_per_year;

    return to_save_each_month;
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


