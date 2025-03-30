// Make sure ReactIs is available for styled-components 
if (!window.ReactIs && window.styled) {
  window.ReactIs = { 
    default: window.React,
    typeOf: function(obj) { 
      return obj && obj.$$typeof ? obj.$$typeof : undefined;
    }
  };
} 