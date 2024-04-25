import { Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import { DataService } from '../../data.service';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';
import * as jsonData from '../indicator-categories.json';
import * as echarts from 'echarts';

HC_exporting(Highcharts);

@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.css']
})
export class IndicatorsListComponent implements OnInit {
  @ViewChild('treeChartContainer', { static: true }) treeChartContainer: ElementRef;


  constructor(private dataService: DataService) {}

  indicatorsList: string[] = [];
  indicatorsListDuplicate: string[] = [];
  eventsList: string[] = [];
  tuplesArray: any[] = [];
  metricsList: string[] = [];
  indList: string[] = [];
  indList2: { [key: string]: string[] } = {};
  catIndList: string[] = [];
  activitiesList: string[] = [];
  aggregateData: any[] = [];
  Highcharts: typeof Highcharts = Highcharts;
  pieChartOptions: Highcharts.Options;
  barChartOptions: Highcharts.Options;

ngOnInit() {
  this.dataService.getdata().subscribe(data => {
    this.processData(data);
    const transformedData = this.transformDataToEChartsTree(data);
    console.log("Transformed Tree Data:", transformedData); 
    this.initTreeChart(transformedData);
  });
  this.newJson();
  this.generateAggregateIndicatorData();
}

newJson() {
  this.catIndList = [];

  jsonData.list.forEach(category => {
    this.indList2[category.category] = [];

    category.indicators.forEach(indicator => {
      const regex = /,(?![^\[]*\])/g;
      this.indList2[category.category].push(...indicator.indiName.split(regex).map(ind => ind.trim()));
      const indicators = indicator.indiName.split(regex);
      this.catIndList.push(...indicators);
    });
  });

}

generateAggregateIndicatorData() {
  this.aggregateData = [];
  const baseIntensity = 255;
  const intensityStep = 30;

  this.catIndList.forEach(indicator => {
    // Extrahieren Sie den Indikatornamen und entfernen Sie die eckigen Klammern
    const name = indicator.replace(/\s*\[.*?\]\s*$/, '').trim();

    // Extrahieren Sie die Zahlen in den eckigen Klammern
    const numbersMatch = indicator.match(/\[(.*?)\]/);
    const numbers = numbersMatch ? numbersMatch[1].split(',').length : 0;

    let currentIntensity = baseIntensity - (numbers * intensityStep);
    currentIntensity = currentIntensity < 0 ? 0 : currentIntensity;

    // Erstellen Sie ein Objekt mit dem Namen, der Anzahl und einer zufälligen Farbe
    this.aggregateData.push({
      name: name,
      y: numbers,
      color: `rgb(0, 0, ${currentIntensity})`
    });
  });

  this.aggregateData.sort((a, b) => b.y - a.y);

  return this.aggregateData;
}

transformDataToEChartsTree(data) {
  const treeData = {
    name: "openLAIR",
    children: data.map(event => ({
      name: event.LearningEvents,
      children: event.LearningActivities.map(activity => ({
        name: activity.Name,
        children: activity.indicator.map(indicator => ({
          name: indicator.indicatorName,
          children: indicator.metrics.split(', ').map(metric => ({
            name: metric
          }))
        }))
      }))
    }))
  };
  return treeData;
}

initTreeChart(transformedData: any) {
  const treeChart = echarts.init(this.treeChartContainer.nativeElement);
  const option = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: "{b}: {c}" // b ist der Knotenname, c die Wert
    },
    series: [{
      type: 'tree',
      data: [transformedData],
      top: '1%',
      left: '7%',
      bottom: '1%',
      right: '20%',
      symbolSize: 7,
      label: {
        position: 'left',
        verticalAlign: 'middle',
        align: 'right',
        fontSize: 15,
        fontWeight: 'bold',
        color: '#000'
      },
      leaves: {
        label: {
          position: 'right',
          verticalAlign: 'middle',
          align: 'left'
        }
      },
      lineStyle: {
        color: '#ccc',
        width: 2,
        type: 'solid' // 'dotted', 'dashed'
      },
      itemStyle: {
        color: '#123456', 
        borderColor: '#123456',
        borderWidth: 2
      },
      expandAndCollapse: true,
      animationDuration: 550,
      animationDurationUpdate: 750
    }]
  };
  treeChart.setOption(option);
}

transformData(data: any): any {
  // ... Ihre Logik zur Umwandlung der Daten
}

splitIndicator(indicator: string): string[] {
  // Extrahieren Sie den Verweis
  const referenceMatch = indicator.match(/\[\d+\]$/);
  let reference = "";
  if (referenceMatch) {
    reference = referenceMatch[0];
  }

  // Entfernen Sie den Verweis aus dem ursprünglichen String
  const indicatorWithoutReference = indicator.replace(reference, '').trim();

  // Teilen Sie den String bei "and" auf und fügen Sie den Verweis zu jedem Teil hinzu
  return indicatorWithoutReference.split(' and ').map(part => `${part.trim()} ${reference}`);
}

processData(data: any) {
  let tempIndicators: string[] = [];
  let tempEvents: string[] = [];
  let tempMetrics: string[] = [];
  let tempActivities: string[] = [];

  data.forEach(item => {
    if (item && item.LearningActivities) {
      item.LearningActivities.forEach(activity => {
        if (activity && activity.indicator) {
          activity.indicator.forEach(ind => {
            if (ind && ind.indicatorName) {
              const splitIndicators = this.splitIndicator(ind.indicatorName);
              tempIndicators.push(...splitIndicators);
            }
          });
        }
      });
    }
  });

  data.forEach(item => {
    if (item && item.LearningEvents) {
      tempEvents.push(item.LearningEvents);
    }
  });

  data.forEach(item => {
    if (item && item.LearningActivities) {
      item.LearningActivities.forEach(activity => {
        if (activity && activity.Name) {
          tempActivities.push(activity.Name);
        }
      });
    }
  });

  data.forEach(item => {
    // ... (Verarbeitung von LearningEvents und Indicators bleibt unverändert)

    if (item && item.LearningActivities) {
      item.LearningActivities.forEach(activity => {
        if (activity && activity.indicator) {
          activity.indicator.forEach(ind => {
            if (ind && ind.metrics) {
              tempMetrics.push(...ind.metrics.split(', ').map(metric => metric.trim()));
            }
          });
        }
      });
    }
  });
  
  this.indicatorsList = [...new Set(tempIndicators)];
  this.indicatorsListDuplicate = [...this.indicatorsList];
  this.eventsList = [...new Set(tempEvents)];
  this.metricsList = [...new Set(tempMetrics)];
  this.activitiesList = [...new Set(tempActivities)];


  this.indicatorsListDuplicate.sort((a, b) => {
    // Entfernen Sie die [Zahl] aus beiden Strings
    let textA = a.replace(/\[\d+\]$/, '').trim();
    let textB = b.replace(/\[\d+\]$/, '').trim();

    // Vergleichen Sie die beiden Strings
    if (textA < textB) {
      return -1;
    }
    if (textA > textB) {
      return 1;
    }
    return 0;
  });

  this.indicatorsListDuplicate = this.indicatorsListDuplicate.map(item => item.replace(/\[\d+\]$/, '').trim());

  this.indList = [...new Set(this.indicatorsListDuplicate)];

  this.indList = this.indList.map(ind => 
    ind.toLowerCase().replace(/\(s\)$/,'').trim()
  );

  this.indList = [...new Set(this.indList)];

  let frequencyObj = {};

  this.indicatorsListDuplicate.forEach(item => {
    if (frequencyObj[item]) {
      frequencyObj[item]++;
    } else {
      frequencyObj[item] = 1;
    }
  });

  // Leeren Sie tuplesArray, bevor Sie es neu befüllen
  this.tuplesArray = [];

  for (let key in frequencyObj) {
    this.tuplesArray.push({
      name: key,
      y: frequencyObj[key],
      color: `rgb(0, 0, 0)`
    });
  }

  // Sortieren Sie das Array basierend auf der Anzahl der Vorkommen
  this.tuplesArray.sort((a, b) => b.y - a.y);
  const topTenItems = this.aggregateData.slice(0, 10);
  const barChartData = topTenItems.map(item => {
    return {
      name: item.name,
      y: item.y
    };
  });
  
  this.pieChartOptions = {
    chart: {
      type: 'pie'
    },
    title: {
      text: 'Top 10 Indicators'
    },
    series: [{
      type: 'pie',
      data: topTenItems // Stellen Sie sicher, dass chartData korrekt definiert ist
    }]
  };

  this.barChartOptions = {
    chart: {
      type: 'bar'
    },
    title: {
      text: 'Top 10 Indicators'
    },
    xAxis: {
      categories: barChartData.map(data => data.name),
      title: {
        text: null
      }
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Occurrences',
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    series: [{
      type: 'bar',
      name: 'Indicators',
      data: barChartData.map(data => data.y)
    }]
  };
};



logIndicators() {
  console.log(this.indicatorsList);
  console.log(this.indicatorsListDuplicate);
  console.log(this.tuplesArray);
  console.log('Learning Events:', this.eventsList);
  console.log('Metrics:', this.metricsList);
  console.log('Indicators:', this.indList);
  console.log('Activities:', this.activitiesList);
  console.log('CatIndi:', this.indList2);
  console.log('CatIndi1:', this.aggregateData);
}

}
