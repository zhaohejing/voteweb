window.util = {
	getQueryParam: function() {
		var _query = window.location.search,
			_queries = [],
			_params = {};
		_queries = unescape(_query).substr(1).split("&");
		if(_queries.length > 0) {
			for(index = 0; index < _queries.length; index++) {
				var o = _queries[index];
				var _oKeyValues = o.split("=");
				if(_oKeyValues.length == 2) {
					if(Boolean(_oKeyValues[0]))
						_params[_oKeyValues[0].toLowerCase()] = _oKeyValues[1];
				}
			}
		}
		return _params;
	}
}
