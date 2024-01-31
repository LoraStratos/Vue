let eventBus = new Vue();

Vue.component('product-tabs', {     
    template: `
    <div>   
        <ul>
            <span class="tab"
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
            >{{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Отзывы'">
            <p v-if="!reviews.length">Отзывов нет</p>
            <ul>
                <li v-for="review in reviews">
                <p>{{ review.name }}</p>
                <p>Рейтинг: {{ review.rating }}</p>
                <p>{{ review.review }}</p>
                </li>
            </ul>
        </div>
        <div v-show="selectedTab === 'Оставить отзыв'">
            <product-review  @submit-review="addReview"/>
       </div>
    </div>
  `,
    data() {
        return {
            tabs: ['Отзывы', 'Оставить отзыв'],
            selectedTab: 'Отзывы',
            reviews: []
        };
    },
    methods: {
        addReview(reviews){
            this.reviews.push(reviews);
        }
    }
});

Vue.component('product-review', {
    template: `
        <form class="review-form" @submit.prevent="onSubmit">
            <p v-if="errors.length">
                <b>Пожалуйста исправьте ошибки:</b>
                <ul>
                <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>    
            <p>
                <label for="name">Имя:</label>
                <input id="name" v-model="name" placeholder="Имя">
            </p>
            <p>
                <label for="review">Отзыв:</label>
                <textarea id="review" v-model="Отзыв"></textarea>
            </p>
            <p>
                <label for="rating">Рейтинг:</label>
                <select id="rating" v-model.number="rating">
                    <option>5</option>
                    <option>4</option>
                    <option>3</option>
                    <option>2</option>
                    <option>1</option>
                </select>
            </p>
            <p>
                <input type="submit" value="Оставить отзыв"> 
            </p>
            

        </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: [],
        };
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating
                };
                this.$emit('submit-review', productReview)
                eventBus.$emit('review-submitted', productReview);
                this.name = null;
                this.review = null;
                this.rating = null;
            } else {
                if(!this.name) this.errors.push("Имя обязательно.");
                if(!this.review) this.errors.push("Отзыв обязателен.");
                if(!this.rating) this.errors.push("Рейтинг обязателен.");
            }
        },         
        addReview(productReview) {
            this.reviews.push(productReview);
        },
         
    },
});

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array,
            required: true
        },
        
    },
    template: `
    <div class="product">
        <div class="product-image">
            <img :src="image" :alt="altText"/>
        </div>
        <div class="product-info">
            <h1>{{ title }}</h1>
            <p v-if="inStock">В наличии</p>
            <p v-else :class="{ outOfStock: !inStock }">Нет в наличии</p>
            <tabs-information :shipping="shipping" :details=" details"></tabs-information>

            <button :class="{ disabledButton: !noSizeS }">S</button>
            <button :class="{ disabledButton: !noSizeM }">M</button>
            <button :class="{ disabledButton: !noSizeL }">L</button>
            <button :class="{ disabledButton: !noSizeXl }">XL</button>
            <button :class="{ disabledButton: !noSizeXXl }">XXL</button>
            <button :class="{ disabledButton: !noSizeXXXl }">XXXL</button>

            <div
                    class="color-box"
                    v-for="(variant, index) in variants"
                    :key="variant.variantId"
                    :style="{ backgroundColor:variant.variantColor }"
                    @click="updateProduct(index)"></div>
            <button
                    v-on:click="addToCart"
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }">Добавить в корзину
            </button>
            <button v-on:click="remoteToCart" class="remoteToCart">Убрать из корзины</button>
            
        </div>
        <product-tabs :reviews="reviews"></product-tabs>
    </div>
    `,
    data() {
        return {
            product: "Носки",
            brand: 'Vue Mastery',
            reviews: [],
            selectedVariant: 0,
            altText: "Пара носков",
            details: ['80% хлопок', '20% полиэстер', 'Гендерно-нейтральный'],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    sizeS: 0,
                    sizeM: 40,
                    sizeL: 20,
                    sizeXl: 30,
                    sizeXXl: 0,
                    sizeXXXl: 10,
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0
                }
            ],
        };
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        remoteToCart() {
            if (this.cart.length > 0) {
                this.$emit('remote-to-cart', this.cart[this.cart.length - 1]);
            }
        },
        updateProduct(index) {
            this.selectedVariant = index;
        },              
        
         
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity;
        },
        shipping() {
            if (this.premium) {
                return "Бесплатно";
            } else {
                return 2.99;
            }
        },
        noSizeS(){
            return this.variants[this.selectedVariant].sizeS;
        },
        noSizeM(){
            return this.variants[this.selectedVariant].sizeM;
        },
        noSizeL(){
            return this.variants[this.selectedVariant].sizeL;
        },
        noSizeXl(){
            return this.variants[this.selectedVariant].sizeXl;
        },
        noSizeXXl(){
            return this.variants[this.selectedVariant].sizeXXl;
        },
        noSizeXXXl(){
            return this.variants[this.selectedVariant].sizeXXXl;
        },
        mounted() {
            eventBus.$on('review-submitted', productReview => {
                this.reviews.push(productReview);
            })
        }
    }
});

Vue.component('tabs-information', {
    props: {
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        }
    },
    template: `
      <div>
        <ul>
          <span class="tab" 
                :class="{ activeTab: selectedTab === tab }"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
          >{{ tab }}</span>
        </ul>
        <div v-show="selectedTab === 'Доставка'">
          <p>{{ shipping }}</p>
        </div>
        <div v-show="selectedTab === 'Детали'">
          <ul>
            <li v-for="detail in details">{{ detail }}</li>
          </ul>
        </div>
    
      </div>
    `,
    data() {
        return {
            tabs: ['Доставка', 'Детали'],
            selectedTab: 'Доставка'
        }
    }
});

let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: [],
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        remoteToCart(id) {
            let index = this.cart.indexOf(id);
            if (index !== -1) {
                this.cart.splice(index, 1);
            }
        }
        
    }
});
 