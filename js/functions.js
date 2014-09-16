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
  //alert('signup = '+uname+' '+imel+' '+pwd);
  $('#'+showid).slideToggle();
  $.post("http://labtekindie.net/trippp/user/signup", { username: uname, password:pwd,email:imel }, function( data ) {
      var resp = JSON.parse(data);
      $('#'+showid).slideToggle();
      if (resp.response){
          //simpan di storage
          var logged = {'id': resp.id};
          console.log(logged);
          localStorage.setItem('logged', JSON.stringify(logged));
          //redirect
          window.location = "demo.html";
      }else{
          alert("Failed to signup");
      }
  }, "json");
}

function setLogin(uname,pwd,showid){
  //alert('login : '+uname+' '+pwd);
  $('#'+showid).slideToggle();
  $.post("http://labtekindie.net/trippp/user/login", { username:uname, password:pwd }, function( data ) {
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
  window.location = "login.html";
}

function getPin(pinColor,label){
  //console.log(pinColor);
    var pinImage = new google.maps.MarkerImage("http://www.googlemapsmarkers.com/v1/"+label+"/"+pinColor+"/",
        new google.maps.Size(21, 34),
        new google.maps.Point(0,0),
        new google.maps.Point(10, 34));
    
    return pinImage;
};

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
    $.get("http://labtekindie.net/trippp/trip/list/"+lat+"/"+lon, function(data) {
        var resp = JSON.parse(data);
        if (resp.response) {
            //save to storage
            //localStorage.setItem('browselist', JSON.stringify(resp.data));
            //tampilkan
            for (key in resp.data){ //infowindow ???
              var pinImage = getPin('FFD42A','T');
              var marker = new google.maps.Marker({
                position: new google.maps.LatLng(resp.data[key].lat, resp.data[key].lon),
                title:resp.data[key].judul,
                icon: pinImage,
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
    $.get("http://labtekindie.net/trippp/trip/view/"+idtrip, function(data) {
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

    function pindahAddplace(){
      var vuserid = JSON.parse(localStorage.getItem('logged'));
      var uid = vuserid.id;
      window.location = "savedplaces.html?uid="+uid;
    }

    function pindahHal(hal){
      window.location = hal+".html";
    }

    function getListTrip(lat,lon,filters,qwords){
      $.get("http://labtekindie.net/trippp/trip/list/"+lat+"/"+lon, { filter:filters,qword:qwords }, function(data) {
          var resp = JSON.parse(data);
          if (resp.response) {
              //save to storage
              localStorage.setItem('browselist', JSON.stringify(resp.data));
              //console.log(resp.data);
              //tampilkan
              $("#content_browse").html('');
              for (key in resp.data){
                var strContent = "";
                strContent += "<li><a onclick='pindahView("+resp.data[key].idTrip+")' href='#'><div class='browse1' id=\"viewlist-"+resp.data[key].idTrip+"\"><p>"+resp.data[key].judul+"</p><div class='circleBase type1'></div><div class='ratingc'>";
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
                $("#content_browse").append(strContent);
                //change bg
                if (resp.data[key].coverfoto){
                  $('#viewlist-'+resp.data[key].idTrip).css('background-image', 'url(\"http://labtekindie.net/trippp/'+resp.data[key].coverfoto+'\")');
                }else{
                  $('#viewlist-'+resp.data[key].idTrip).css('background-image', 'url(img/default-background.png)');
                }
              }
              //$("#content_browse").html(strContent);
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
      $("#content_browse").html('');
      for (key in resps){
        var strContent = "";
        strContent += "<li><a onclick='pindahView("+resps[key].idTrip+")' href='#'><div class='browse1' id=\"viewlist-"+resps[key].idTrip+"\"><p>"+resps[key].judul+"</p><div class='circleBase type1'></div><div class='ratingc'>";
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
        strContent += "</div><div id='mapbtn'><img src='img/map_btn.png'></div></div></a></li>";
        $("#content_browse").append(strContent);
        //change bg
        if (resps[key].coverfoto){
          $('#viewlist-'+resps[key].idTrip).css('background-image', 'url(\"http://labtekindie.net/trippp/'+resps[key].coverfoto+'\")');
        }else{
          $('#viewlist-'+resps[key].idTrip).css('background-image', 'url(img/default-background.png)');
        }
      }
      //$("#content_browse").html(strContent);
      classie.toggle( menuSort, 'cbp-spmenu-open' );
    }

    function getMyListTrip(uid,filters){
      $.get("http://labtekindie.net/trippp/trip/done/"+uid, { filter:filters,qword:'' }, function(data) {
          var resp = JSON.parse(data);
          if (resp.response) {
              //save to storage
              localStorage.setItem('browselist', JSON.stringify(resp.data));
              //console.log(resp.data);
              //tampilkan
              $("#content_browse").html('');
              for (key in resp.data){
                var strContent = "";
                strContent += "<li><a onclick='pindahView("+resp.data[key].idTrip+")' href='#'><div class='browse1' id=\"viewlist-"+resp.data[key].idTrip+"\"><p>"+resp.data[key].judul+"</p><div class='circleBase type1'></div><div class='ratingc'>";
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
                $("#content_browse").append(strContent);
                //change bg
                if (resp.data[key].coverfoto){
                  $('#viewlist-'+resp.data[key].idTrip).css('background-image', 'url(\"http://labtekindie.net/trippp/'+resp.data[key].coverfoto+'\")');
                }else{
                  $('#viewlist-'+resp.data[key].idTrip).css('background-image', 'url(img/default-background.png)');
                }
              }
              //$("#content_browse").html(strContent);
          }else{
              alert("Nothing trips nearby right now");
          }
      }, "json");
    }

  function getSavedPlace(uid,filters,qwords){
      $.get("http://labtekindie.net/trippp/place/saved/", { uid:uid,filter:filters,qword:qwords }, function(data) {
          var resp = JSON.parse(data);
          if (resp.response) {
              //save to storage
              localStorage.setItem('savedplacelist', JSON.stringify(resp.data));
              //console.log(resp.data);
              //tampilkan
              var strContent = "";
              for (key in resp.data){
                var datap = JSON.stringify(resp.data[key]);
                strContent += "<li><a onclick='addPlaceToTrip("+datap+")' href='#'><div class='place1'><p>"+resp.data[key].nama+"</p>";
                strContent += "<div id='mapbtn'><img src='img/map_btn.png' /></div></div></a></li>";
              }
              $("#content_browse").html(strContent);
          }else{
              alert("Nothing place saved");
          }
      }, "json");
    }

  function addPlaceToTrip(datap){
    var jsonRec = JSON.parse(localStorage.getItem('createRoute'));
    var urutan = jsonRec.places.length;
    var createR = new Object();
    createR['key'] = urutan;
    createR['judul'] = datap.nama;
    createR['ket'] = (datap.keterangan) ? datap.keterangan : 'add keterangan';
    createR['pic'] = (datap.fotourl) ? 'http://labtekindie.net/trippp/'+datap.fotourl : '';
    createR['lat'] = datap.lat;
    createR['lon'] = datap.lon;
    createR['kota'] = datap.kota;
    createR['durasi'] = 0;
    createR['jamSt'] = '00';
    createR['menitSt'] = '00';
    createR['jamEnd'] = '00';
    createR['menitEnd'] = '00';
    createR['tiket'] = 0;
    createR['makan'] = 0;
    jsonRec.places.push(createR);
    console.log(jsonRec);
    localStorage.setItem('createRoute', JSON.stringify(jsonRec));
    //pindah
    window.location = "create.html";
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
    $.post("http://labtekindie.net/trippp/place/add", { nama:vnama,kota:vkota,lat:vlat,lon:vlon,userid:vuserid.id }, function( data ) {
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
  function addPlaces(iplace, storage){
        if (storage == undefined) storage="createRoute";
        $('#content_places').append(contentPlace(iplace,storage));
        $("#content_places").trigger('create');
      }
      function contentPlace(idx,storage){  
        if (storage == undefined) storage="createRoute";
var content = '<li>    <div class="view2" id=\"picPlace-'+idx+'\">      <div class=\"judul_tempat\"><a style=\"color:white;\" href=\"#popupjudulTempat-'+idx+'\" data-rel=\"popup\" data-transition=\"pop\"><span id=\"judulTempat-'+idx+'\">nama tempat ...</span></a></div><div class=\"text-tempat cat_img\"><a style=\"color:#fff !important;\" href=\"#popupket_tempat-'+idx+'\" data-rel=\"popup\" data-transition=\"pop\"><span id=\"ket_tempat-'+idx+'\">keterangan ...</span></a></div>      <div class=\"map_img\">        <div class=\"map_img\"><a href=\"\"><img class=\"img_btn\" src=\"img/map_btn.png\" /></a></div>        <div class=\"gal_img\"><a href=\"\" onclick=\"document.getElementById(\'take-picture-'+idx+'\').click()\"><img class=\"img_btn\" src=\"img/gallery_btn.png\" /></a></div>      </div><div class=\"ui-input-hide\"><input type=\"file\" id=\"take-picture-'+idx+'\" accept=\"image/*\" onchange=\"loadImagePlace(\''+idx+'\',\''+storage+'\')\"></div></div><div class=\"rwd2\" style=\"margin-top:10px;\"><a style=\"color:#000 !important;\" href=\"#popupJam_tempat-'+idx+'\" data-rel=\"popup\" data-transition=\"pop\">        <div class=\"ui-block-a\"><img src=\"img/time.png\"></div>        <div class=\"ui-block-b\"><div class=\"stat_text\"><span class=\"dina_text\" id=\"dina_jam'+idx+'\">24</span>h</div></div>        <div class=\"ui-block-c\"><div class=\"stat_text\"><span class=\"dina_text\" id=\"dina_men'+idx+'\">0</span>m</div></div>        <div class=\"ui-block-d\"></div>        <div class=\"ui-block-e\"><div class=\"stat_text\"><span class=\"dina_text\" id=\"jamStart2_tempat-'+idx+'\">00</span>.<span class=\"dina_text\" id=\"menitStart2_tempat-'+idx+'\">00</span>-<span class=\"dina_text\" id=\"jamEnd2_tempat-'+idx+'\">00</span>.<span class=\"dina_text\" id=\"menitEnd2_tempat-'+idx+'\">00</span></div></div>        <div style=\"clear:both\"></div>        </a>      </div><!-- grid jam -->    <div class=\"rwd3\">      <a style=\"color:#000 !important;\" href=\"#popupTiket_tempat-'+idx+'\" data-rel=\"popup\" data-transition=\"pop\">        <div class=\"ui-block-a\"><img src=\"img/ticket.png\"></div>        <div class=\"ui-block-b\"><div class=\"stat_text\">Rp.<span class=\"dina_text\" id=\"hargaTiket2_tempat-'+idx+'\">0</span></div>        </div>        <div class=\"ui-block-c\"></div>        <div class=\"ui-block-d\"><img src=\"img/food_bev.png\"></div>        <div class=\"ui-block-e\"><div class=\"stat_text\">Rp.<span class=\"dina_text\" id=\"hargaFood2_tempat-'+idx+'\">0</span></div></div>        <div style=\"clear:both\"></div>      </a>    </div><!-- grid harga -->    <!--div class=\"rwd4\">    <a style=\"color:#000 !important;\" href=\"#popupVeh\" data-rel=\"popup\" data-transition=\"pop\">      <div class=\"ui-block-a\"><span id=\"imgveh\"><img src=\"img/vehcl_bus.png\"></span></div></a>    <a style=\"color:#000 !important;\" href=\"#popupVeh_judul\" data-rel=\"popup\" data-transition=\"pop\">      <div class=\"ui-block-b dina_text\"><span id=\"judul-textveh\">Angkot</span><span>A</span> - <span>B</span></div></a>      <div style=\"clear:both\"></div>    </div>    <div class=\"text-veh\"><a style=\"color:#000 !important;\" href=\"#popupket_Veh\" data-rel=\"popup\" data-transition=\"pop\"><span id=\"ket_vehicle\">keterangan ...</a></span></div-->    <!--INI ADALAH POP UP-->    <div data-role=\"popup\" id=\"popupjudulTempat-'+idx+'\">      <input type=\"text\" name=\"text-2\" id=\"text-judultempat-'+idx+'\" onchange=\"gantiJudulTempat(\'text-judultempat-\',\'judulTempat-\',\'add title...\',\'judul\','+idx+',\''+storage+'\')\" value=\"\" placeholder=\"judul\" data-enhanced=\"true\">    </div>     <div data-role=\"popup\" id=\"popupJam_tempat-'+idx+'\">      <div class=\"waktu_mulai text_cen margin_top_bot\"><img src=\"img/time.png\"><span class=\"mulai_text\">start time</span></div>      <div class=\"waktu_mulai_form\">        <input class=\"lebar50\" type=\"text\" name=\"jamStart\" id=\"jamStart_tempat-'+idx+'\" value=\"\" placeholder=\"18\"  data-enhanced=\"true\">        <input class=\"lebar50\" type=\"text\" name=\"menitStart\" id=\"menitStart_tempat-'+idx+'\" value=\"\" placeholder=\"59\"  data-enhanced=\"true\">      </div>      <div class=\"waktu_akhir text_cen margin_top_bot\"><img src=\"img/time.png\"><span class=\"end_text\">end time</span></div>      <div class=\"waktu_end_form\">        <input class=\"lebar50\" type=\"text\" name=\"jamEnd\" id=\"jamEnd_tempat-'+idx+'\" value=\"\" placeholder=\"18\"  data-enhanced=\"true\">        <input class=\"lebar50\" type=\"text\" name=\"menitEnd\" id=\"menitEnd_tempat-'+idx+'\" value=\"\" placeholder=\"59\"  data-enhanced=\"true\">      </div>      <div class=\"tombolPopup\"><a href=\"#\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Cancel</a><a href=\"#\" onclick=\"gantiJamTempat('+idx+',\''+storage+'\');\" value=\"\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Done</a>      </div>    </div>     <div data-role=\"popup\" id=\"popupTiket_tempat-'+idx+'\">      <div class=\"imgtiket text_cen margin_top_bot\"><img src=\"img/ticket.png\">ticket</div>      <div><form>Rp.<input class=\"lebar50\" type=\"text\" name=\"hargaTiket\" id=\"hargaTiket_tempat-'+idx+'\" value=\"\" placeholder=\"18\"  data-enhanced=\"true\"></form></div>      <div class=\"imgfood text_cen margin_top_bot\"><img src=\"img/food_bev.png\">food &amp; bev</div>      <div><form>Rp.<input class=\"lebar50\" type=\"text\" name=\"hargaFood\" id=\"hargaFood_tempat-'+idx+'\" value=\"\" placeholder=\"18\"  data-enhanced=\"true\"></form></div>      <!--<div><img src=\"img/rent.png\"> rent</div>      <div><form>Rp.<input class=\"lebar50\" type=\"text\" name=\"hargaRent\" id=\"hargaRent\" value=\"\" placeholder=\"18\"  data-enhanced=\"true\"></form></div>-->      <div class=\"tombolPopup\"><a href=\"#\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Cancel</a>      <a href=\"#\" onclick=\"gantiBiayaTempat('+idx+',\''+storage+'\');\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Done</a></div>    </div>     <div data-role=\"popup\" id=\"popupket_tempat-'+idx+'\">      <textarea value=\"\" name=\"textarea-6\" placeholder=\"Lorem ipsum dolor sit amet,\" data-enhanced=\"true\" id=\"ket_tempat2-'+idx+'\"></textarea>      <div class=\"tombolPopup\"><a href=\"#\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Cancel</a><a href=\"#\" onclick=\"gantiJudulTempat(\'ket_tempat2-\',\'ket_tempat-\',\'add keterangan\',\'ket\','+idx+',\''+storage+'\')\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Done</a>      </div>    </div>    <!--div data-role=\"popup\" id=\"popupVeh\">      <div class=\"text_popveh\">pick a vehicle</div>      <a href=\"\" onclick=\"gantiveh()\" class=\"ui-btn\" data-rel=\"back\"  ><img src=\"img/vehcl_bus.png\"></a>      <a href=\"\" onclick=\"gantiveh2()\" class=\"ui-btn\" data-rel=\"back\"><img src=\"img/vehcl_private.png\"></a>      <a href=\"\" onclick=\"gantiveh3()\" class=\"ui-btn\" data-rel=\"back\"><img src=\"img/vehcl_taxi.png\"></a>      <a href=\"\" onclick=\"gantiveh4()\" class=\"ui-btn\" data-rel=\"back\"><img src=\"img/vehcl_walk.png\"></a>      <a href=\"\" onclick=\"gantiveh5()\" class=\"ui-btn\" data-rel=\"back\"><img src=\"img/vehcl_bike.png\"></a>      <div style=\"clear:both\"></div>    </div>    <div data-role=\"popup\" id=\"popupVeh_judul\">      <input type=\"text\" name=\"text-2\" id=\"text-judulveh\" onchange=\"gantiJudul(\"text-judulveh\",\"judul-textveh\",\''+storage+'\')\" value=\"\" placeholder=\"judul\"  data-enhanced=\"true\">    </div>    <div data-role=\"popup\" id=\"popupket_Veh\">      <textarea value=\"\" name=\"textarea-6\" placeholder=\"Lorem ipsum dolor sit amet,\" data-enhanced=\"true\" id=\"ket_vehicle2\"></textarea>      <div class=\"tombolPopup\"><a href=\"#\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Cancel</a><a href=\"#\" onclick=\"gantiJudul(\"ket_vehicle2\",\"ket_vehicle\")\" class=\"ui-btn ui-corner-all ui-btn-inline ui-btn-a lebar50\" data-rel=\"back\">Done</a>      </div>    </div-->  </li>';  
return content;
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
    $.post("http://labtekindie.net/trippp/trip/rec/"+vuserid.id, { tripadd:JSON.stringify(ntrip) }, function( data ) {
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
  $.get("http://labtekindie.net/trippp/trip/view/"+idtrip, function(data) {
      var resp = JSON.parse(data);
      if (resp.response) {
          //tampilkan
          var strContent = "";
          //judul, thumbfoto, coverphoto
          strContent += "<div class='view1' id='picRoute'><div class='judul_view'>"+resp.data.judul+"</div><div class='circleBase type1'></div><div class='ratingc'>";
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
      strContent += "<div class='view2' id=\"picPlace-"+places[b].idPlace+"\"><div class='judul_tempat'>"+places[b].nama+"</div><div class='text-tempat cat_img'>"+places[b].keterangan+"</div><div class='map_img'><div><img src='img/gallery_btn.png'></div><div><img src='img/map_btn.png'></div></div></div>";
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
     //ganti bg
     $('#picRoute').css('background-image', 'url(http://labtekindie.net/trippp/'+resp.data.coverfoto+')');
     for (var b=0; b<places.length; b++){
      $('#picPlace-'+places[b].idPlace).css('background-image', 'url(http://labtekindie.net/trippp/'+places[b].foto[0]+')');
     }
      }else{
          alert("Nothing trips right now");
      }
  }, "json");
}
function simpanTempatJSON(inputan,kolom,urut,storage){
  var jsonRec = JSON.parse(localStorage.getItem(storage));
  jsonRec['places'][urut][kolom] = inputan;
  localStorage.setItem(storage, JSON.stringify(jsonRec));
}
function simpanJSON(inputan,kolom,storage){
  var jsonRec = JSON.parse(localStorage.getItem(storage));
  jsonRec[kolom] = inputan;
  localStorage.setItem(storage, JSON.stringify(jsonRec));
}
function gantiJudul(intext,outtext,def,kolom,storage){
  if (storage == undefined) storage="createRoute";
  var inputan = $('#'+intext).val();
  if (inputan=="") inputan = def;
  $('#'+outtext).html(inputan);
  //simpan di json
  simpanJSON(inputan,kolom,storage);
}
function gantiJudulTempat(intext,outtext,def,kolom,urut,storage){
  if (storage == undefined) storage="createRoute";
  var inputan = $('#'+intext+urut).val();
  if (inputan=="") inputan = def;
  $('#'+outtext+urut).html(inputan);
  //simpan di json
  simpanTempatJSON(inputan,kolom,urut,storage);
}
function cebokbring(listgrup,popcek,storage){
  if (storage == undefined) storage="createRoute";
  var arrTags = getCheckMulti(listgrup);
  console.log(arrTags);
  var gambar = '';
  for ( var i = 0; i < arrTags.length;i++){
    switch(arrTags[i]){
      case 'cash': gambar = 'bring_cash';break;
      case 'camera': gambar = 'bring_camera';break;
      case 'food': gambar = 'bring_food';break;
      case 'nohigh': gambar = 'bring_high_heels';break;
      case 'picnic': gambar = 'bring_picnic_mat';break;
      case 'wat': gambar = 'bring_water';break;
    }
    if (i == 0) { 
      $('#'+popcek).html('<div class="imgbring"><img src="img/'+gambar+'.png"/>&nbsp;&nbsp;</div>');
    } else {
      $('#'+popcek).append('<div class="imgbring"><img src="img/'+gambar+'.png"/>&nbsp;&nbsp;</div>');
    }
  };
  simpanJSON(arrTags,'brings',storage);
}
function genBrings(arrTags,popcek){
  if (popcek == undefined) popcek="bringsRoute";
  var gambar = '';
  for ( var i = 0; i < arrTags.length;i++){
    switch(arrTags[i]){
      case 'cash': gambar = 'bring_cash';break;
      case 'camera': gambar = 'bring_camera';break;
      case 'food': gambar = 'bring_food';break;
      case 'nohigh': gambar = 'bring_high_heels';break;
      case 'picnic': gambar = 'bring_picnic_mat';break;
      case 'wat': gambar = 'bring_water';break;
    }
    if (i == 0) { 
      $('#'+popcek).html('<div class="imgbring"><img src="img/'+gambar+'.png"/>&nbsp;&nbsp;</div>');
    } else {
      $('#'+popcek).append('<div class="imgbring"><img src="img/'+gambar+'.png"/>&nbsp;&nbsp;</div>');
    }
  };
}
function cebok(listgrup,popcek,storage){
  if (storage == undefined) storage="createRoute";
  if (popcek == undefined) popcek="tagsRoute";
  var arrTags = getCheckMulti(listgrup);
  console.log(arrTags);
  var gambar = '';
  for ( var i = 0; i < arrTags.length;i++){
    switch(arrTags[i]){
      case 'edu': gambar = 'cat_educational_white';break;
      case 'culi': gambar = 'cat_culinary_white';break;
      case 'cult':gambar = 'cat_culture_white';break;
      case 'eco': gambar = 'cat_economical_white';break;
      case 'fam': gambar = 'cat_family_white';break;;  
      case 'his': gambar = 'cat_history_white';break;
      case 'nat': gambar = 'cat_nature_white';break;
      case 'rom': gambar = 'cat_romantic_white';break;
    }
    if (i == 0) { 
      $('#'+popcek).html('<div><img class="icontag" src="img/'+gambar+'.png" /></div>');
    }else {
      $('#'+popcek).append('<div><img class="icontag" src="img/'+gambar+'.png" /></div>');
    }
  };
  simpanJSON(arrTags,'tags',storage);
}
function genTags(arrTags,popcek){
  if (popcek == undefined) popcek="tagsRoute";
  var gambar = '';
  for ( var i = 0; i < arrTags.length;i++){
    switch(arrTags[i]){
      case 'edu': gambar = 'cat_educational_white';break;
      case 'culi': gambar = 'cat_culinary_white';break;
      case 'cult':gambar = 'cat_culture_white';break;
      case 'eco': gambar = 'cat_economical_white';break;
      case 'fam': gambar = 'cat_family_white';break;;  
      case 'his': gambar = 'cat_history_white';break;
      case 'nat': gambar = 'cat_nature_white';break;
      case 'rom': gambar = 'cat_romantic_white';break;
    }
    if (i == 0) { 
      $('#'+popcek).html('<div><img class="icontag" src="img/'+gambar+'.png" /></div>');
    }else {
      $('#'+popcek).append('<div><img class="icontag" src="img/'+gambar+'.png" /></div>');
    }
  };
}
function gantiveh(i){
  var gambar = '';
  switch(i){
    case 1 : gambar = 'vehcl_bus'; break;
    case 2 : gambar = 'vehcl_private'; break;
    case 3 : gambar = 'vehcl_taxi'; break;
    case 4 : gambar = 'vehcl_walk'; break;
    case 5 : gambar = 'vehcl_bike'; break;
  }
  $('#imgveh').html('<div><img src="img/'+gambar+'.png" /></div>')
}
function gantiDurasi(jSt,mSt,jEnd,mEnd,idx){
  if (idx == undefined) idx="";
  var m2 = parseInt(mEnd);
  var m1 = parseInt(mSt);
  var j2 = parseInt(jEnd);
  var j1 = parseInt(jSt);
  var jlebih = 0;
  var msel = 0;
  //var msel = (m2 < m1) ? m2+60-m1 : m2-m1;
  if (m2 < m1) {
    msel = m2+60-m1;
    jlebih--;
  }else{
    msel = m2-m1;
  }
  jlebih += Math.floor(msel/60); 
  msel = msel%60;
  var jsel = (j2 < j1) ? j2+24-j1+jlebih : j2-j1+jlebih;
  $('#dina_jam'+idx).html(jsel);
  $('#dina_men'+idx).html(msel);
}
function gantiJam(storage){
  if (storage == undefined) storage="createRoute";
  gantiJudul('jamStart','jamStart2','00','jamSt',storage);
  gantiJudul('menitStart','menitStart2','00','menitSt',storage);
  gantiJudul('jamEnd','jamEnd2','00','jamEnd',storage);
  gantiJudul('menitEnd','menitEnd2','00','menitEnd',storage);
  //
  gantiDurasi($('#jamStart').val(),$('#menitStart').val(),$('#jamEnd').val(),$('#menitEnd').val());
}
function gantiJamTempat(idx,storage){
  if (storage == undefined) storage="createRoute";
  gantiJudulTempat('jamStart_tempat-','jamStart2_tempat-','00','jamSt',idx,storage);
  gantiJudulTempat('menitStart_tempat-','menitStart2_tempat-','00','menitSt',idx,storage);
  gantiJudulTempat('jamEnd_tempat-','jamEnd2_tempat-','00','jamEnd',idx,storage);
  gantiJudulTempat('menitEnd_tempat-','menitEnd2_tempat-','00','menitEnd',idx,storage);
  //
  gantiDurasi($('#jamStart_tempat-'+idx).val(),$('#menitStart_tempat-'+idx).val(),$('#jamEnd_tempat-'+idx).val(),$('#menitEnd_tempat-'+idx).val(),idx);
}
function gantiBiaya(storage){
  if (storage == undefined) storage="createRoute";
  var tiket = parseInt($('#hargaTiket').val());
  var food = parseInt($('#hargaFood').val());
  $('#hargaTiket2').html(int_to_rp(tiket));
  $('#hargaFood2').html(int_to_rp(food));
  //
  simpanJSON(tiket,'tiket',storage);
  simpanJSON(food,'makan',storage);
}
function gantiBiayaTempat(idx,storage){
  if (storage == undefined) storage="createRoute";
  var tiket = parseInt($('#hargaTiket_tempat-'+idx).val());
  var food = parseInt($('#hargaFood_tempat-'+idx).val());
  $('#hargaTiket2_tempat-'+idx).html(int_to_rp(tiket));
  $('#hargaFood2_tempat-'+idx).html(int_to_rp(food));
  //
  simpanTempatJSON(tiket,'tiket',idx,storage);
  simpanTempatJSON(food,'makan',idx,storage);
  var jsonRec = JSON.parse(localStorage.getItem(storage));
  for (key in jsonRec.places) {
    console.log(jsonRec.places[key]);
  }
}
function loadImagePlace(id,storage){
    if (storage == undefined) storage="createRoute";
      var fileSelected=document.getElementById("take-picture-"+id).files;
        if (fileSelected.length>0)
         {
          var fileToLoad=fileSelected[0];
          if(fileToLoad.type.match("image.*"))
          {
            var fileReader=new FileReader();
            fileReader.onload=function(fileLoadedEvent)
            {
              // var imageLoaded=document.getElementById("blah");
              // imageLoaded.src=fileLoadedEvent.target.result;
              $('#picPlace-'+id).css('background-image', 'url('+fileLoadedEvent.target.result+')');
              var imgurl = String(fileLoadedEvent.target.result);
              var createR = JSON.parse(localStorage.getItem(storage));
              createR['places'][id]['pic'] = imgurl;
              console.log(createR['places'][id]);
              localStorage.setItem(storage, JSON.stringify(createR));  
            };
            fileReader.readAsDataURL(fileToLoad);
          }
        }
     }
function loadImageFileAsURL(storage){
  if (storage == undefined) storage="createRoute";
      var fileSelected=document.getElementById("take-picture").files;
        if (fileSelected.length>0)
         {
          var fileToLoad=fileSelected[0];
          if(fileToLoad.type.match("image.*"))
          {
            var fileReader=new FileReader();
            fileReader.onload=function(fileLoadedEvent)
            {
              // var imageLoaded=document.getElementById("blah");
              // imageLoaded.src=fileLoadedEvent.target.result;
              $('#picRoute').css('background-image', 'url('+fileLoadedEvent.target.result+')');
              var imgurl = String(fileLoadedEvent.target.result);
              var createR = JSON.parse(localStorage.getItem(storage));
              createR['pic'] = imgurl;
              console.log(createR);
              localStorage.setItem(storage, JSON.stringify(createR));  
            };
            fileReader.readAsDataURL(fileToLoad);
          }
        }
     }
