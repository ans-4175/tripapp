//initiate
// Functions
function toObject(arr) {
  var rv = {};
  for (var i = 0; i < arr.length; ++i)
    rv[i] = arr[i];
  return rv;
}
function twoDigits(d) {
    if(0 <= d && d < 10) return "0" + d.toString();
    if(-10 < d && d < 0) return "-0" + (-1*d).toString();
    return d.toString();
}
function getCurTime(){
  var dt = new Date();
  dt = twoDigits(dt.getHours()) + ":" + twoDigits(dt.getMinutes()) + ":" + twoDigits(dt.getSeconds());
  console.log(dt);
  return dt;
}
//

function getValue(varname) {
    var url = window.location.href;
    var qparts = '';
    var ampExists = (url.indexOf('?') >= 0) ? true : false;
    if (!ampExists) return "";
    qparts = url.split("?");
    if (qparts.length == 0) {
        return "";
    }
    var query = qparts[1];
    var vars = query.split("&");
    var value = "";
    for (i=0;i<vars.length;i++) {
        var parts = vars[i].split("=");
        if (parts[0] == varname) {
            value = parts[1];
            break;
        }
    }
    value = unescape(value);
    value = value.replace(/\+/g," ");
    return value;
}

function removeHtmlStorage(name) {
    localStorage.removeItem(name);
    localStorage.removeItem(name+'_time');
}

function setHtmlStorage(name, value, expires) {
    if (expires==undefined || expires=='null') { var expires = 360000; } // default: 100h

    var date = new Date();
    var schedule = Math.round((date.setSeconds(date.getSeconds()+expires))/1000);

    localStorage.setItem(name, value);
    localStorage.setItem(name+'_time', schedule);
}

function statusHtmlStorage(name) {
    var date = new Date();
    var current = Math.round(+date/1000);

    // Get Schedule
    var stored_time = localStorage.getItem(name+'_time');
    if (stored_time==undefined || stored_time=='null') { var stored_time = 0; }
    // Expired
    if (stored_time < current) {
        // Remove
        removeHtmlStorage(name);
        return 0;
    } else {
        return 1;
    }
}

function setSignUp(uname,pwd,imel,showid){
  //ajax to create
  $('#'+showid).slideToggle();
  $.post("http://localhost/htdocs/trippp/user/signup", { username: uname, password:pwd,email:imel }, function( data ) {
      var resp = JSON.parse(data);
      $('#'+showid).slideToggle();
      if (resp.response){
          //simpan di storage
          var logged = {'id': resp.id};
          console.log(logged);
          localStorage.setItem('logged', JSON.stringify(logged));
          //redirect
          window.location = "browse.html";
      }else{
          alert("Failed to signup");
      }
  }, "json");
}

function setLogin(uname,pwd,showid){
  $('#'+showid).slideToggle();
  $.post("http://localhost/htdocs/trippp/user/login", { username:uname, password:pwd }, function( data ) {
        var resp = JSON.parse(data);
        $('#'+showid).slideToggle();
        if (resp.response){
            //simpan di storage
            var logged = {'id': resp.id};
            console.log(logged);
            localStorage.setItem('logged', JSON.stringify(logged));
            //redirect
            window.location = "browse.html";
        }else{
            alert("Failed to login");
        }
    }, "json");
}

function logOut(){
  localStorage.removeItem('logged');
  window.location = "index.html";
}

function initMap(imaps,divid,lat,lon) {
    var map_canvas = document.getElementById(divid);
    var myLatlng = new google.maps.LatLng(lat, lon);
    var map_options = {
      center: myLatlng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    imaps.map = new google.maps.Map(map_canvas, map_options);
    imaps.marker = new google.maps.Marker({
        position: myLatlng,
        title:"This is you",
        icon:"img/marker.png"
    });
    // To add the marker to the map, call setMap();
    imaps.marker.setMap(imaps.map);
    //listplace
    $.get("http://localhost/htdocs/trippp/trip/list/"+lat+"/"+lon, function(data) {
        var resp = JSON.parse(data);
        if (resp.response) {
            //save to storage
            //localStorage.setItem('browselist', JSON.stringify(resp.data));
            //tampilkan
            for (key in resp.data){ //infowindow ???
              var marker = new google.maps.Marker({
                position: new google.maps.LatLng(resp.data[key].lat, resp.data[key].lon),
                title:resp.data[key].judul,
                map: imaps.map
              });
              imaps.listmarkers.push(marker);
            }
        }else{
            alert("Nothing trips list in map right now");
        }
    }, "json");
  }

  function initRoute(imaps,divid,lat,lon,idtrip) {
    var map_canvas = document.getElementById(divid);
    $.get("http://localhost/htdocs/trippp/trip/view/"+idtrip, function(data) {
        var resp = JSON.parse(data);
        if (resp.response) {
            var myLatlng = new google.maps.LatLng(resp.data.lat, resp.data.lon);
            var map_options = {
              center: myLatlng,
              zoom: 15,
              mapTypeId: google.maps.MapTypeId.ROADMAP
            }
            imaps.map = new google.maps.Map(map_canvas, map_options);
            imaps.marker = new google.maps.Marker({
                position: myLatlng,
                title:"This is starting route",
                icon:"img/marker.png"
            });
            imaps.marker.setMap(imaps.map);
            //routing
            var infoWindow = new google.maps.InfoWindow();
            var latlngbounds = new google.maps.LatLngBounds();
            var lat_lng = new Array();
            for (i = 0; i < resp.data.places.length; i++) {
              var data = resp.data.places[i];
              var myLatlng2 = new google.maps.LatLng(data.lat, data.lon);
              lat_lng.push(myLatlng2);
              var marker = new google.maps.Marker({
                  position: myLatlng2,
                  map: imaps.map,
                  title: data.nama
              });
              latlngbounds.extend(marker.position);
              (function (marker, data) {
                  google.maps.event.addListener(marker, "click", function (e) {
                      infoWindow.setContent(data.keterangan);
                      infoWindow.open(imaps.map, marker);
                  });
              })(marker, data);
            }
            imaps.map.setCenter(latlngbounds.getCenter());
            imaps.map.fitBounds(latlngbounds);
            //Intialize the Path Array
            var path = new google.maps.MVCArray();
            //Intialize the Direction Service
            var service = new google.maps.DirectionsService();
            //Set the Path Stroke Color
            var poly = new google.maps.Polyline({ map: imaps.map, strokeColor: '#ffd42a' });
            //Loop and Draw Path Route between the Points on MAP
            for (var i = 0; i < lat_lng.length; i++) {
                //if ((i + 1) < lat_lng.length) {
                    var src = lat_lng[i];
                    var des = lat_lng[i + 1];
                    //console.log(i);
                    path.push(src);
                    poly.setPath(path);
                    service.route({
                        origin: src,
                        destination: des,
                        travelMode: google.maps.DirectionsTravelMode.DRIVING
                    }, function (result, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                                path.push(result.routes[0].overview_path[i]);
                            }
                        }
                    });
                //}
            }
            //
        }else{
            alert("Nothing trips right now");
        }
    }, "json");
    // To add the marker to the map, call setMap();
  }

  function setMarkerPosition(imaps,lat,lon) {
      imaps.marker.setPosition(
          new google.maps.LatLng(
              lat,
              lon)
      );
      imaps.map.setCenter(imaps.marker.getPosition());
  }

    function getCheckMulti(iddiv){
      var names = [];
        $('#'+iddiv+' input:checked').each(function() {
            names.push(this.name);
        });
        return names;
    }

    function pindahView(id){
      window.location = "view.html?id="+id;
    }

    function pindahHal(hal){
      window.location = hal+".html";
    }

    function getListTrip(lat,lon,filters){
      $.get("http://localhost/htdocs/trippp/trip/list/"+lat+"/"+lon, { filter:filters,qword:'' }, function(data) {
          var resp = JSON.parse(data);
          if (resp.response) {
              //save to storage
              localStorage.setItem('browselist', JSON.stringify(resp.data));
              //console.log(resp.data);
              //tampilkan
              var strContent = "";
              for (key in resp.data){
                strContent += "<li><a onclick='pindahView("+resp.data[key].idTrip+")' href='#'><div class='browse1'><p>"+resp.data[key].judul+"</p><div class='circleBase type1'></div><div class='ratingc'>";
                  //cost
                  strContent += "<div>";
                  for (var b=1; b<=5; b++){
                    strContent += (b<=resp.data[key].rating_dana) ? "<img src='img/cost.png'>" : "";
                  }
                  strContent += "</div>";
                  //rating
                  strContent += "<div>";
                  for (var b=1; b<=5; b++){
                    strContent += (b<=resp.data[key].ratings) ? "<img src='img/rate.png'>" : "";
                  }
                  strContent += "</div>";
                  //distance
                  strContent += "<div>";
                  for (var b=1; b<=5; b++){
                    strContent += (b<=resp.data[key].rating_jarak) ? "<img src='img/distance.png'>" : "";
                  }
                  strContent += "</div>";
                strContent += "</div><div id='mapbtn'><img src='img/map_btn.png'></div></div></a></li>";
              }
              $("#content_browse").html(strContent);
          }else{
              alert("Nothing trips nearby right now");
          }
      }, "json");
    }

    function sortListTrip(filters){
      //save to storage
      var resps = JSON.parse(localStorage.getItem('browselist'));
      //
      switch (filters){
        case 1:
          resps.sort(function(a, b){
              if(a.ratings > b.ratings) return -1;
              if(a.ratings < b.ratings) return 1;
              return 0;
          });
          break;
        case 2:
          resps.sort(function(a, b){
              if(a.rating_jarak > b.rating_jarak) return -1;
              if(a.rating_jarak < b.rating_jarak) return 1;
              return 0;
          });
          break;
        case 3:
          resps.sort(function(a, b){
              if(a.rating_dana > b.rating_dana) return -1;
              if(a.rating_dana < b.rating_dana) return 1;
              return 0;
          });
          break;
        case 4:
          resps.sort(function(a, b){
              if(a.rating_duration > b.rating_duration) return -1;
              if(a.rating_duration < b.rating_duration) return 1;
              return 0;
          });
          break;
        default:
          resps.sort(function(a, b){
              if(a.idTrip > b.idTrip) return -1;
              if(a.idTrip < b.idTrip) return 1;
              return 0;
          });
          break;
      }
      //tampilkan
      var strContent = "";
      for (key in resps){
        strContent += "<li><a onclick='pindahView("+resps[key].idTrip+")' href='#'><div class='browse1'><p>"+resps[key].judul+"</p><div class='circleBase type1'></div><div class='ratingc'>";
          //cost
          strContent += "<div>";
          for (var b=1; b<=5; b++){
            strContent += (b<=resps[key].rating_dana) ? "<img src='img/cost.png'>" : "";
          }
          strContent += "</div>";
          //rating
          strContent += "<div>";
          for (var b=1; b<=5; b++){
            strContent += (b<=resps[key].ratings) ? "<img src='img/rate.png'>" : "";
          }
          strContent += "</div>";
          //distance
          strContent += "<div>";
          for (var b=1; b<=5; b++){
            strContent += (b<=resps[key].rating_jarak) ? "<img src='img/distance.png'>" : "";
          }
          strContent += "</div>";
        strContent += "</div><div id='mapbtn'><img src='img/map_btn.png'></div></div></a></li>";
      }
      $("#content_browse").html(strContent);
    }

    function getMyListTrip(uid,filters){
      $.get("http://localhost/htdocs/trippp/trip/done/"+uid, { filter:filters,qword:'' }, function(data) {
          var resp = JSON.parse(data);
          if (resp.response) {
              //save to storage
              localStorage.setItem('browselist', JSON.stringify(resp.data));
              //console.log(resp.data);
              //tampilkan
              var strContent = "";
              for (key in resp.data){
                strContent += "<li><a onclick='pindahView("+resp.data[key].idTrip+")' href='#'><div class='browse1'><p>"+resp.data[key].judul+"</p><div class='circleBase type1'></div><div class='ratingc'>";
                  //cost
                  strContent += "<div>";
                  for (var b=1; b<=5; b++){
                    strContent += (b<=resp.data[key].rating_dana) ? "<img src='img/cost.png'>" : "";
                  }
                  strContent += "</div>";
                  //rating
                  strContent += "<div>";
                  for (var b=1; b<=5; b++){
                    strContent += (b<=resp.data[key].ratings) ? "<img src='img/rate.png'>" : "";
                  }
                  strContent += "</div>";
                  //distance
                  strContent += "<div>";
                  for (var b=1; b<=5; b++){
                    strContent += (b<=resp.data[key].rating_jarak) ? "<img src='img/distance.png'>" : "";
                  }
                  strContent += "</div>";
                  var marker = (resp.data[key].isDone) ? "marker_done" : "marker_wishlist";
                strContent += "</div><div id='mapbtn'><img src='img/map_btn.png'></div></div><div class='marker_done'><img class='marker_done' src='img/"+marker+".png'></div></a></li>";
              }
              $("#content_browse").html(strContent);
          }else{
              alert("Nothing trips nearby right now");
          }
      }, "json");
    }

  function addPlace(key){
    //kirim
    var placelist = JSON.parse(localStorage.getItem('4sqlist'));
    var vnama = placelist[key].nama;
    var vkota = placelist[key].kota;
    var vlat = placelist[key].lat;
    var vlon = placelist[key].lon;
    var vuserid = JSON.parse(localStorage.getItem('logged'));
    console.log(vuserid.id);
    $.post("http://localhost/htdocs/trippp/place/add", { nama:vnama,kota:vkota,lat:vlat,lon:vlon,userid:vuserid.id }, function( data ) {
        var resp = JSON.parse(data);
        if (resp.response){
            console.log(resp.response);
            alert('Place "'+vnama+'"" has been saved');
            classie.toggle( pushmenu, 'cbp-spmenu-open' );
        }else{
            alert("Failed to save place");
        }
    }, "json");
        //cek
        localStorage.removeItem('4sqlist');
  }
  //
  function addRoute(key){
    //kirim
    var placelist = JSON.parse(localStorage.getItem('4sqlist'));
    var vnama = placelist[key].nama;
    var vkota = placelist[key].kota;
    var vlat = placelist[key].lat;
    var vlon = placelist[key].lon;
    var vuserid = JSON.parse(localStorage.getItem('logged'));
    console.log(vuserid.id);
    //ambil dari startRec
    var startRec = JSON.parse(localStorage.getItem('startRec'));
    //simpan route
    var rec1 = {
      'lat': vlat,
      'lon': vlon,
      'time': getCurTime(),
      'nama':vnama,
      'kota':vkota,
      'ket':''
    };
    startRec.push(rec1);
    localStorage.setItem('startRec', JSON.stringify(startRec));
    console.log(startRec);
    //cek
    localStorage.removeItem('4sqlist');
    alert('Place "'+vnama+'"" has been added to route');
    classie.toggle( pushmenu, 'cbp-spmenu-open' );
    //add marker
  }
  //
  function savingTrip(pushm){
    var places = JSON.parse(localStorage.getItem('startRec'));
    var tripc = {
      judul:'',
      ket:'',
      cover:'',
    };
    var trippl = [{
      ket:'',
      tiket:'',
      makan:'',
      durasi:''
    }];
    var journey = [{
      jenis:'',
      kend:'',
      waktu:'',
      tiket:''
    }];
    var vuserid = JSON.parse(localStorage.getItem('logged'));
    var ntrip = {
      places:places,
      trip:tripc,
      trippl:trippl,
      journey:journey
    };
    $.post("http://localhost/htdocs/trippp/trip/rec/"+vuserid.id, { tripadd:JSON.stringify(ntrip) }, function( data ) {
        var resp = JSON.parse(data);
        console.log(resp.response);
        localStorage.removeItem('startRec');
        alert('Trip has been saved');
        classie.toggle( pushm, 'cbp-spmenu-open' );
    }, "json");
  }
  //
  function listPlaceTo(lat,lon,pushm,lista){
        var ret = [];
        $.getJSON( "https://api.foursquare.com/v2/venues/search?ll="+lat+","+lon+"&radius=100&limit=10&intent=browse&client_id=FJWPOZ2AQB3OZABDYZJMI1WQHBQBJWLAQHO5M1CKBSN4RBTO&client_secret=NCKBSSHHRXDOBIQBEEJ1NF5LJAPGJZPABCIO1LDHWMV0ANTK&v=20140707", function(data) {
          var temp = null;
          var strContent = "";
          for (var key in data.response.venues) {
            temp = {
              id:data.response.venues[key].id,
              nama:data.response.venues[key].name,
              lat:data.response.venues[key].location.lat,
              lon:data.response.venues[key].location.lng,
              kota:data.response.venues[key].location.city,
            }
            ret[key] = temp;
          }
          key++;
          temp = {
              id:'',
              nama:'New Place',
              lat:lat,
              lon:lon,
              kota:'',
            }
          ret.unshift(temp);
          localStorage.setItem('4sqlist', JSON.stringify(ret));
          //console.log(ret);
          //tampilin di panel
          for (key in ret){
            strContent += "<li><a onclick='addPlace("+key+")' class='ui-btn ui-btn-icon-left ui-custom-icon ui-arrow-c ui-nodisc-icon'>"+ret[key].nama+"</a></li>";
          }
          $('#'+lista).html(strContent);
        });
      };
    //
    function listRouteTo(lat,lon,pushm,lista){
        var ret = [];
        $.getJSON( "https://api.foursquare.com/v2/venues/search?ll="+lat+","+lon+"&radius=100&limit=10&intent=browse&client_id=FJWPOZ2AQB3OZABDYZJMI1WQHBQBJWLAQHO5M1CKBSN4RBTO&client_secret=NCKBSSHHRXDOBIQBEEJ1NF5LJAPGJZPABCIO1LDHWMV0ANTK&v=20140707", function(data) {
          var temp = null;
          var strContent = "";
          for (var key in data.response.venues) {
            temp = {
              id:data.response.venues[key].id,
              nama:data.response.venues[key].name,
              lat:data.response.venues[key].location.lat,
              lon:data.response.venues[key].location.lng,
              kota:data.response.venues[key].location.city,
            }
            ret[key] = temp;
          }
          key++;
          temp = {
              id:'',
              nama:'New Place',
              lat:lat,
              lon:lon,
              kota:'',
            }
          ret.unshift(temp);
          localStorage.setItem('4sqlist', JSON.stringify(ret));
          //console.log(ret);
          //tampilin di panel
          for (key in ret){
            strContent += "<li><a onclick='addRoute("+key+")' class='ui-btn ui-btn-icon-left ui-custom-icon ui-arrow-c ui-nodisc-icon'>"+ret[key].nama+"</a></li>";
          }
          $('#'+lista).html(strContent);
        });
      };

function getHM(minutes,times){
  this.mins = minutes%60;
  this.hours = Math.floor(minutes/60);
  this.clock = times.split(":");
  this.clmins = (parseInt(this.clock[1])+this.mins)%60;
  this.clhours = (parseInt(this.clock[0])+this.hours)%24;
}

function pad_2(number)
{
     return (number < 10 ? '0' : '') + number;
}

function int_to_rp(num) {
  num = parseInt(num);
  var int = num.toString();
  var i = 0;
  var retval = "";
  for (var j = int.length - 1; j >= 0; j--) {
    if (i == 3) {
      retval = int[j]+"."+retval;
      i = 1;
    } else {
      retval = int[j]+retval;
      i++;
    }   
  }
  //retval = "Rp. "+retval;

  return retval;
}

function getTrip(idtrip){
  $.get("http://localhost/htdocs/trippp/trip/view/"+idtrip, function(data) {
      var resp = JSON.parse(data);
      if (resp.response) {
          //tampilkan
          var strContent = "";
          //judul, thumbfoto, coverphoto
          strContent += "<div class='view1'><div class='judul_view'>"+resp.data.judul+"</div><div class='circleBase type1'></div><div class='ratingc'>";
          //cost
            strContent += "<div>";
            for (var b=1; b<=5; b++){
              strContent += (b<=resp.data.rating_dana) ? "<img src='img/cost.png'>" : "";
            }
            strContent += "</div>";
            //rating
            strContent += "<div>";
            for (var b=1; b<=5; b++){
              strContent += (b<=resp.data.ratings) ? "<img src='img/rate.png'>" : "";
            }
            strContent += "</div>";
            //distance
            strContent += "<div>";
            for (var b=1; b<=5; b++){
              strContent += (b<=resp.data.rating_jarak) ? "<img src='img/distance.png'>" : "";
            }
            strContent += "</div>";
            strContent += "</div><div class='cat_img'><img src='img/cat_family_white.png'></div><div class='map_img'><img src='img/map_btn.png'></div></div>";
          window.title = resp.data.judul;
          //$("#judul-trip").html(resp.data.judul);
      //deskripsi
      strContent += "<div id='text_desc'><p>"+resp.data.keterangan+"</p></div>";
      strContent += "<div class='separator'></div>";
      //jam
      var dt = new getHM(resp.data.durasi,resp.data.waktumulai);
      strContent += "<div class='rwd2'><div class='ui-block-a'><img src='img/time.png'></div><div class='ui-block-b'><div class='stat_text'><span class='dina_text'>"+dt.hours+"</span>h</div></div><div class='ui-block-c'><div class='stat_text'><span class='dina_text'>"+dt.mins+"</span>m</div></div><div class='ui-block-d'></div><div class='ui-block-e'><div class='stat_text'><span class='dina_text'>"+dt.clock[0]+":"+dt.clock[1]+"</span>-<span class='dina_text'>"+pad_2(dt.clhours)+":"+pad_2(dt.clmins)+"</span></div></div><div style='clear:both'></div></div>";
      strContent += "<div class='rwd3'><div class='ui-block-a'><img src='img/ticket.png'></div><div class='ui-block-b'><div class='stat_text'>Rp.<span class='dina_text'>"+int_to_rp(resp.data.danatiket)+"</span></div></div><div class='ui-block-c'></div><div class='ui-block-d'><img src='img/food_bev.png'></div><div class='ui-block-e'><div class='stat_text'>Rp.<span class='dina_text'>"+int_to_rp(resp.data.danamakan)+"</span></div></div><div style='clear:both'></div></div>";
      strContent += "<div class='separator'></div>";
     strContent += "<div><ul data-role='listview' data-icon='false' id='content_browse' class='ui-listview'>";
     var places = resp.data.places;
     var journeys = resp.data.journeys;
     for (var b=0; b<places.length; b++){
      strContent += "<li class='ui-li-static ui-body-inherit'>";
      strContent += "<div class='view2'><div class='judul_tempat'>"+places[b].nama+"</div><div class='text-tempat cat_img'>"+places[b].keterangan+"</div><div class='map_img'><div><img src='img/gallery_btn.png'></div><div><img src='img/map_btn.png'></div></div></div>";
      dt = new getHM(places[b].durasi,places[b].waktumulai);
      strContent += "<div class='rwd2' style='margin-top:10px'><div class='ui-block-a'><img src='img/time.png'></div><div class='ui-block-b'><div class='stat_text'><span class='dina_text'>"+dt.hours+"</span>h</div></div><div class='ui-block-c'><div class='stat_text'><span class='dina_text'>"+dt.mins+"</span>m</div></div><div class='ui-block-d'></div><div class='ui-block-e'><div class='stat_text'><span class='dina_text'>"+dt.clock[0]+":"+dt.clock[1]+"</span>-<span class='dina_text'>"+pad_2(dt.clhours)+":"+pad_2(dt.clmins)+"</span></div></div><div style='clear:both'></div></div>";
      strContent += "<div class='rwd3'><div class='ui-block-a'><img src='img/ticket.png'></div><div class='ui-block-b'><div class='stat_text'>Rp.<span class='dina_text'>"+int_to_rp(places[b].danatiket)+"</span></div></div><div class='ui-block-c'></div><div class='ui-block-d'><img src='img/food_bev.png'></div><div class='ui-block-e'><div class='stat_text'>Rp.<span class='dina_text'>"+int_to_rp(places[b].danamakan)+"</span></div></div><div style='clear:both'></div></div>";
      if (b<places.length-1){
        strContent += "<div class='rwd4'><div class='ui-block-a'><img src='img/vehcl_bus.png'></div><div class='ui-block-b dina_text'>Public Transport</div><div style='clear:both'></div></div><div class='text-veh'>"+journeys[b].keterangan+"</div>";
      }
      strContent += "</li>";
     };
     strContent += "</ul></div>";
     //console.log(strContent);
          $("#view-content").html(strContent);
      }else{
          alert("Nothing trips right now");
      }
  }, "json");
}