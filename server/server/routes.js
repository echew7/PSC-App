import React from 'react';
import {Route} from 'react-router';

import App from './components/app';
import NoMatch from './components/common/NoMatch';

export default (
    <Route path="/" component={App}>
        <Route path="*" component={NoMatch}/>
    </Route>
);
