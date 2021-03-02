/*eslint-disable*/
import {Showalert} from './alert';
import axios from 'axios';
const stripe = Stripe('pk_test_51IDmd0EIfZxbTWDRfEpRVGJgrOgkJRzhE7wzzij38zOUY2xJQPfnkQ2A7ovnpKRCwDOalQq6r6lCO8TcuVzv5Hbm007leawY4t')

export const bookTour = async (tourId) => { //tourId is coming from tour.pug where tour.id has specified
    try {
        //Get checkout session for API
        const session = await axios(`/api/v1/booking/checkout-session/${tourId}`)
        
        //2 create chechout form+change credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
        
    } catch (err) {
        console.log(session);
        Showalert('err', err);
    }
}