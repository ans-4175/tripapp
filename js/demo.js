function demonext(){
  var currentSlide = $('.active-slide');
  var nextSlide = currentSlide.next();

  var currentDot = $('.active-dot');
  var nextDot = currentDot.next();

  if(nextDot.length === 0) {
    nextSlide = $('.slide').first();
    nextDot = $('.dot').first();
  }
  
  currentSlide.fadeOut(600).removeClass('active-slide');
  nextSlide.fadeIn(600).addClass('active-slide');

  currentDot.removeClass('active-dot');
  nextDot.addClass('active-dot');
}

function demoprev(){
  var currentSlide = $('.active-slide');
  var prevSlide = currentSlide.prev();

  var currentDot = $('.active-dot');
  var prevDot = currentDot.prev();

  if(prevDot.length === 0) {
    prevSlide = $('.slide').last();
    prevDot = $('.dot').last();
  }
  
  currentSlide.fadeOut(600).removeClass('active-slide');
  prevSlide.fadeIn(600).addClass('active-slide');

  currentDot.removeClass('active-dot');
  prevDot.addClass('active-dot');
}

function skipped(){
  var currentSlide = $('.active-slide');
  var currentDot = $('.active-dot');
  var lastSlide = $('.slide').last();
  var lastDot = $('.dot').last();
  
  currentSlide.fadeOut(600).removeClass('active-slide');
  lastSlide.fadeIn(600).addClass('active-slide');

  currentDot.removeClass('active-dot');
  lastDot.addClass('active-dot');
}