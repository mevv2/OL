import { Component, OnInit } from '@angular/core';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-indicators-list',
  templateUrl: './indicators-list.component.html',
  styleUrls: ['./indicators-list.component.css']
})
export class IndicatorsListComponent implements OnInit {
  indicatorsList: string[] = [];

  constructor(private dataService: DataService) {}

  ngOnInit() {

  }
}
