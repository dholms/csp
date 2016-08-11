var input = [];
var added = [];
var schedule ={
  Rena: {M:[],T:[],W:[],H:[],F:[]},
  Dobbins: {M:[],T:[],W:[],H:[],F:[]},
  Hargraves: {M:[],T:[],W:[],H:[],F:[]},
  SouthEstes: {M:[],T:[],W:[],H:[],F:[]}
}

var driversFirst = function(array) {
    return array.sort(function(a, b) {
        var x = a["drive"]; var y = b["drive"];
        return ((x > y) ? -1 : ((x < y) ? 1 : 0));
    });
}

var totalSort = function(array){
  var temp = driversFirst(array);
  var hasCenter = [];
  var noCenter = [];
  for(var i = 0; i < temp.length; i++){
    if(temp[i].center == ""){
      hasCenter.push(temp[i]);
    } else{
      noCenter.push(temp[i]);
    }
  }
  return hasCenter.concat(noCenter);
}

var parse = function(){
  var value = document.getElementById('input').value;
  var lines = value.split('/');
  if(lines[lines.length-1]==""){
    lines.pop();
  }
  var count = 0;
  for(var i=0; i<lines.length; i++){
    var values = lines[i].split(";");
    var person = {};
    person["name"] = values[0];
    //removes spaces
    var center = values[1].replace(/\s+/g, '')
    if(!(center == "Dobbins" || center == "Rena" || center == "Hargraves" || center == "SouthEstes")){
      center = "";
    }
    person["center"] = center ;
    person["days"] = parseDays(values[2]);
    person["daysnum"] = parseInt(values[3]);
    count += parseInt(values[3]);
    person["drive"] = values[4] == "True";
    for(var j = 0; j < person["daysnum"]; j++){
      input.push(person);
    }
  }
  console.log(count);
  input = totalSort(input);
  for(var i = 0; i < input.length; i++){
    added.push(false);
  }
  newmain();
}

var parseDays = function(str){
  var days = [];
  if(str.includes("Monday")){
    days.push("M");
  }
  if(str.includes("Tuesday")){
    days.push("T");
  }
  if(str.includes("Wednesday")){
    days.push("W");
  }
  if(str.includes("Thursday")){
    days.push("H");
  }
  if(str.includes("Friday")){
    days.push("F");
  }
  return days;
}

var maxDrivers = function(){
  var max = 0;
  for(var center in schedule){
    for(var day in schedule[center]){
      var num = numDrivers(center, day);
      max = Math.max(max, num);
    }
  }
  return max;
}

var numDrivers = function(center, day){
  var cars;
  for(var person in schedule[center][day]){
    if(schedule[center][day][person].drive){
      cars++;
    }
  }
  return cars;
}

var splitbydriver = function(){
  var drivers = [];
  var nondrivers = [];
  for(var i = 0; i < input.length; i++){
    if(input[i].drive){
      drivers.push(input[i]);
    } else{
      nondrivers.push(input[i]);
    }
  }
  return [drivers, nondrivers];
}

var copySchedule = function(toCopy){
  var newschedule = {};
  for(var center in toCopy){
    var newcenter = {};
    for(var day in toCopy[center]){
      var list = toCopy[center][day];
      var temp = [];
      for(var i = 0; i < list.length; i++){
        temp.push(list[i]);
      }
      newcenter[day] = temp;
    }
    newschedule[center]=newcenter;
  }
  return newschedule
}

var combine = function(a,b){
  var newschedule = {};
  for(var center in a){
    var newcenter = {};
    for(var day in a[center]){
      var lista = a[center][day];
      var tempa = [];
      for(var i = 0; i < lista.length; i++){
        tempa.push(lista[i]);
      }
      var listb = b[center][day];
      var tempb = [];
      for(var i = 0; i < listb.length; i++){
        tempb.push(listb[i]);
      }
      newcenter[day] = tempa.concat(tempb);
    }
    newschedule[center]=newcenter;
  }
  return newschedule
}

var resetAdded = function(){
  added = [];
  for(var i = 0; i < input.length; i++){
    added.push(0);
  }
}

var changeToNames = function(a){
  var newschedule = {};
  for(var center in a){
    var newcenter = {};
    for(var day in a[center]){
      var list = schedule[center][day];
      for(var i = 0; i < list.length; i++){
        list[i] = input[list[i]];
      }
      newcenter[day] = list;
    }
    newschedule[center] = newcenter;
  }
  return newschedule;
}

var newmain = function(){
  var split = splitbydriver();
  var drivers = split[0];
  var nondrivers = split[1];
  var inputholder = input.slice(0,input.length);
  input = drivers;
  resetAdded();
  var empty = copySchedule(schedule);
  run();
  var driversschedule = changeToNames(schedule);
  input = nondrivers;
  resetAdded();
  schedule = copySchedule(empty);
  run();
  var nondriversschedule = changeToNames(schedule);
  schedule = combine(driversschedule, nondriversschedule);
  input = inputholder;
  display();
}

var run = function(){
  var finished = false;
  var i = 0;
  var someChanged = true;
  while(!finished && someChanged){
    // var maxDrivers = maxDrivers();
    someChanged = false;
    for(var center in schedule){
      for(var day in schedule[center]){
        for(var i = 0; i < input.length; i++){
          if(!added[i]){
            if(i > 200){
              console.log('here');
            }
            var person = input[i];
            var canAdd = canBeAdded(i, center, day);
            if(canAdd){
              addPerson(i, center, day);
              added[i] = true;
              someChanged = true;
              break;
            }
          }
        }
      }
    }
    if(!someChanged){
      someChanged = addRandomToLeast();
    }
    finished = isFinished();
  }
  display();
}


var addRandomToLeast = function(){
  var centerday = minScheduled();
  var center = centerday[0];
  var day = centerday[1];
  var list = [];
  for(var i = 0; i < input.length; i++){
    if(canBeAdded(i, center, day) && !isScheduled(i, center, day) && canRemove(i)){
      list.push(i);
    }
  }
  var random = list[Math.floor(Math.random()*list.length)];
  if(list.length == 0){
    return false;
  }
  removeFromList(random);
  addPerson(random, center, day);
  return true;
}

var maxScheduled = function(){
  var max = 0;
  for(var center in schedule){
    for(var day in schedule[center]){
      var length = schedule[center][day].length;
      max = Math.max(max, length);
    }
  }
  return max;
}

var canRemove = function(personI){
  var centerday = getCenterDay(personI);
  var max = maxScheduled();
  if(centerday && schedule[centerday[0]][centerday[1]].length == max){
    return true;
  }
  return false;
}

var getCenterDay = function(personI){
  var centerday;
  for(var center in schedule){
    for(var day in schedule[center]){
      if(isScheduled(personI, center, day)){
        centerday = [center,day];
      }
    }
  }
  return centerday;
}

var removeFromList = function(personI){
  var centerday = getCenterDay(personI);
  removePerson(personI, centerday[0], centerday[1]);
}

var removePerson = function(personI, center, day){
  var centerday = schedule[center][day];
  var index =  centerday.indexOf(personI)
  if(index > -1){
    schedule[center][day].splice(index, 1);
  }
}

var isScheduled = function(personI, center, day){
  if(schedule[center][day].indexOf(personI) > -1){
    return true;
  }
  return false;
}

var isFinished = function(){
  for(var i = 0; i < added.length; i++){
    if(added[i]==false){
      return false;
    }
  }
  return true;
}

var canBeAdded = function(personI, center, day){
  var person = input[personI];
  if(person.center != "" && person.center != center){
    return false;
  }
  if(!(person['days'].indexOf(day) > -1)){
    return false;
  }
  if(schedule[center][day].indexOf(personI) > -1){
    return false;
  }

  var maxPerDay = Math.floor(input.length/25);
  // || schedule[center][day].length > minScheduledNum()
  if(schedule[center][day].length > maxPerDay ){
    return false;
  }

  // if(!hasCars(center, day)){
  //   return false;
  // }
  return true;
}

var minScheduled = function(){
  var min = 1000;
  var centerday = [];
  for(var center in schedule){
    for(var day in schedule[center]){
      var num = schedule[center][day].length;
      if(num < min){
        min = num;
        centerday = [center,day];
      }
    }
  }
  return centerday;
}

var minScheduledNum = function(){
  var centerday = minScheduled();
  return schedule[centerday[0]][centerday[1]].length;
}

var addPerson = function(personI, center, day){
  schedule[center][day].push(personI);
}

var display = function(){
  var main = document.getElementById('main');
  var html = "";
  for(var center in schedule){
    html += "<div class='col-md-12'> <h1>" + center + "</h1>";
    var test = schedule[center];
    for(var day in schedule[center]){
      html += "<div class='col-md-2'> <h3>" + day + "</h3>";
      for(var person in schedule[center][day]){
        var pers = schedule[center][day][person];
        if(pers.drive){
          html+="<h5>";
        }
        html += pers.name + "<hr>";
        if(pers.drive){
          html+="</h5>";
        }
      }
      html += "</div>";
    }
    html += "</div>";
  }
  main.innerHTML = html;
}

// var hasCars = function(center, day){
//   var cars = 0;
//   var total = schedule[center][day].length;
//   for(var person in schedule[center][day]){
//     if(schedule[center][day][person].drive){
//       cars++;
//     }
//   }
//   if(cars * 4 >= total){
//     return true;
//   } else{
//     return false;
//   }
// }


// var main = function(){
//   recurse();
//   display();
//   console.log(recur);
// }
// var recur = 0;
// var recurse = function(){
//   recur++;
//   // console.log(schedule);
//   // console.log('here');
//   for(var i = 0; i < input.length; i++){
//     if(!added[i]){
//       var person = input[i];
//       var addedTo = [];
//       var match = false;
//       for(var center in schedule){
//         for(var day in schedule[center]){
//             var canAdd = canBeAdded(person, center, day);
//             if(canAdd){
//               addPerson(person, center, day);
//               added[i] = true;
//               var success = recurse();
//               if(success){
//                 return true;
//                 match = true;
//                 break;
//               } else{
//                 removePerson(center, day);
//                 added[i] = false;
//               }
//             }
//         }
//         if(match)
//           break;
//       }
//     }
//   }
//   var cnt = 0;
//   for(var i = 0 ; i<added.length; i++){
//     if(added[i] == false)
//       cnt++;
//   }
//   console.log(cnt);
//   if(cnt > 0){
//     return false;
//   }
//   console.log(schedule);
//   return true;
// }
