<?php get_header(); ?>

<div class="flex-1 flex items-center justify-center p-4">
  <div class="max-w-3xl py-12 text-dark font-body">

    <?php if (have_posts()) : while (have_posts()) : the_post(); ?>
      <article class="mb-12">
        <div class="flex flex-col md:flex-row items-start gap-4">
          
          <!-- Imagen destacada -->
          <?php if (has_post_thumbnail()) : ?>
            <div class="flex-shrink-0 w-32 md:w-40 aspect-square overflow-hidden rounded-lg shadow-md md:mr-6">
              <a href="<?php the_permalink(); ?>" class="block w-full h-full">
                <?php the_post_thumbnail('medium', [
                  'class' => 'w-full h-full object-cover'
                ]); ?>
              </a>
            </div>
          <?php endif; ?>

          <!-- Contenido -->
          <div class="flex-1">
            <h2 class="text-2xl md:text-3xl font-title font-bold mb-2">
              <a href="<?php the_permalink(); ?>" class="text-primary hover:text-accent transition-colors">
                <?php the_title(); ?>
              </a>
            </h2>
            <div class="text-base">
              <?php the_excerpt(); ?>
            </div>
          </div>

        </div>
      </article>
    <?php endwhile; else : ?>
      <p>No hay publicaciones.</p>
    <?php endif; ?>

  </div>
</div>

<?php get_footer(); ?>
