import PostFoodModal from './PostFoodModal';

export default function AddFoodModal(props) {
  return <PostFoodModal {...props} onSubmitFood={props.onAddFood || props.onSubmitFood} />;
}