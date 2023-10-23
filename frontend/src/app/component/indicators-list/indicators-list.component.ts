import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.css']
})
export class IndicatorsListComponent implements OnInit {

  constructor(private dataService: DataService) {}

  indicatorsList: string[] = [];
  indicatorsListDuplicate: string[] = [];
  tuplesArray: any[] = [];

ngOnInit() {
  this.dataService.getdata().subscribe(data => {
    // Hier verarbeiten Sie die Daten und extrahieren die Indikatoren
    this.processData(data);
  });
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

  this.indicatorsList = [...new Set(tempIndicators)];
  this.indicatorsListDuplicate = [...this.indicatorsList];

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
      color: 'eeeeee'
    });
  }

  // Sortieren Sie das Array basierend auf der Anzahl der Vorkommen
  this.tuplesArray.sort((a, b) => b.y - a.y);
}


logIndicators() {
  console.log(this.indicatorsList);
  console.log(this.indicatorsListDuplicate);
  console.log(this.tuplesArray);
}

}
